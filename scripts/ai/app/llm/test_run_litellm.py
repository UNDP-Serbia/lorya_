import json
import unittest

from run_litellm import run


def fake_completion(content):
    def _fn(**kwargs):
        return {"choices": [{"message": {"content": content}}]}
    return _fn


class RunLitellmTest(unittest.TestCase):
    def test_ocr_canonical_output(self):
        content = json.dumps(
            {
                "lang": "srp",
                "script": "cyrillic",
                "lines": [{"line_id": 1, "words": [{"word_id": 1, "word_text": "На"}]}],
            }
        )
        out = run(
            {"model": "m", "apiKey": "k", "defaultPrompt": "p"},
            {"task": "ocr", "image": "BASE64"},
            completion_fn=fake_completion(content),
        )
        self.assertTrue(out["status"]["success"])
        self.assertEqual(out["lang"], "srp")
        self.assertIsNone(out["lines"][0]["words"][0]["word_confidence"])
        self.assertIsNone(out["statistics"]["avg_word_confidence"])

    def test_ocr_defaults_missing_lang(self):
        content = json.dumps({"lines": []})
        out = run(
            {"model": "m", "apiKey": "k", "defaultPrompt": "p"},
            {"task": "ocr", "image": "x"},
            completion_fn=fake_completion(content),
        )
        self.assertEqual(out["lang"], "und")
        self.assertEqual(out["script"], "")

    def test_post_ocr_canonical_output(self):
        content = json.dumps(
            {"lines": [{"line_id": 1, "words": [{"word_id": 1, "word_text": "слика"}]}]}
        )
        out = run(
            {"model": "m", "apiKey": "k", "defaultPrompt": "p"},
            {"task": "post_ocr", "ocr": {"lines": []}},
            completion_fn=fake_completion(content),
        )
        self.assertTrue(out["status"]["success"])
        self.assertEqual(out["lines"][0]["words"][0]["word_text"], "слика")
        self.assertIsNone(out["statistics"]["cer"])
        self.assertIsNone(out["statistics"]["wer"])

    def test_strips_markdown_fenced_json(self):
        content = "```json\n" + json.dumps({"lines": []}) + "\n```"
        out = run(
            {"model": "m", "apiKey": "k", "defaultPrompt": "p"},
            {"task": "ocr", "image": "x"},
            completion_fn=fake_completion(content),
        )
        self.assertTrue(out["status"]["success"])
        self.assertEqual(out["lines"], [])

    def test_missing_prompt_raises(self):
        with self.assertRaises(ValueError):
            run(
                {"model": "m", "apiKey": "k"},
                {"task": "ocr", "image": "x"},
                completion_fn=fake_completion("{}"),
            )

    def test_unknown_task_raises(self):
        with self.assertRaises(ValueError):
            run(
                {"model": "m", "apiKey": "k", "defaultPrompt": "p"},
                {"task": "bogus"},
                completion_fn=fake_completion("{}"),
            )

    def test_coerces_numeric_string_ids(self):
        content = json.dumps(
            {"lines": [{"line_id": "2", "words": [{"word_id": "3", "word_text": "x"}]}]}
        )
        out = run(
            {"model": "m", "apiKey": "k", "defaultPrompt": "p"},
            {"task": "ocr", "image": "x"},
            completion_fn=fake_completion(content),
        )
        self.assertEqual(out["lines"][0]["line_id"], 2)
        self.assertEqual(out["lines"][0]["words"][0]["word_id"], 3)


if __name__ == "__main__":
    unittest.main()

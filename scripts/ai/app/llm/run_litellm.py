import json
import re
import sys


def _completion(**kwargs):
    # Real LiteLLM call. Imported lazily so the module is importable (and testable)
    # without litellm installed; tests inject a fake completion_fn instead.
    import litellm

    return litellm.completion(**kwargs)


def _coerce_id(value):
    # Match the OCR pipeline, which stores numeric line/word ids. Coerce numeric
    # strings to int so downstream equality checks (e.g. word edits) work; leave
    # non-numeric values untouched.
    try:
        return int(value)
    except (TypeError, ValueError):
        return value


def _normalize_lines(lines):
    normalized = []
    for line in lines or []:
        words = []
        for w in line.get("words", []):
            words.append(
                {
                    "word_id": _coerce_id(w.get("word_id")),
                    "word_confidence": w.get("word_confidence", None),
                    "word_text": w.get("word_text", ""),
                }
            )
        normalized.append(
            {"line_id": _coerce_id(line.get("line_id")), "words": words}
        )
    return normalized


def _build_messages(task, prompt, payload):
    if task == "ocr":
        image = payload.get("image")
        return [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": "data:image/jpeg;base64," + (image or "")},
                    },
                ],
            }
        ]
    # post_ocr
    ocr = payload.get("ocr") or {}
    text = json.dumps(ocr.get("lines", []), ensure_ascii=False)
    return [
        {
            "role": "user",
            "content": prompt + "\n\nOCR JSON:\n" + text,
        }
    ]


def _parse_model_json(content):
    # Some models wrap JSON in markdown code fences (```json ... ```) even when
    # response_format json_object is requested, so strip an optional fence first.
    stripped = content.strip()
    fence = re.match(r"^```(?:json)?\s*(.*?)\s*```$", stripped, flags=re.DOTALL)
    if fence:
        stripped = fence.group(1)
    return json.loads(stripped)


def _to_canonical(task, data):
    base = {
        "status": {"success": True, "messageText": "LLM processing completed"},
        "lang": data.get("lang") or "und",
        "script": data.get("script") or "",
        "lines": _normalize_lines(data.get("lines", [])),
    }
    if task == "post_ocr":
        base["statistics"] = {"avg_word_confidence": None, "cer": None, "wer": None}
    else:
        base["statistics"] = {"avg_word_confidence": None}
    return base


def run(config, payload, completion_fn=_completion):
    task = payload.get("task")
    if task not in ("ocr", "post_ocr"):
        raise ValueError("Unknown task: %s" % task)

    prompt = payload.get("prompt") or config.get("defaultPrompt")
    if not prompt:
        raise ValueError(
            "No prompt configured: set defaultPrompt in the model config "
            "or pass prompt in the request payload"
        )
    params = dict(config.get("parameters") or {})
    params.update(payload.get("parameters") or {})

    messages = _build_messages(task, prompt, payload)
    response = completion_fn(
        model=config["model"],
        api_key=config["apiKey"],
        api_base=config.get("apiBase"),
        messages=messages,
        response_format={"type": "json_object"},
        **params,
    )
    content = response["choices"][0]["message"]["content"]
    data = _parse_model_json(content)
    return _to_canonical(task, data)


def main():
    try:
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            config = json.load(f)
        payload = json.load(sys.stdin)
        out = run(config, payload)
    except Exception as exc:  # noqa: BLE001 — surface any failure as canonical error
        print(json.dumps({"status": {"success": False, "messageText": str(exc)}}))
        sys.exit(1)
    print(json.dumps(out, ensure_ascii=False))


if __name__ == "__main__":
    main()

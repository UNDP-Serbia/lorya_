import psycopg2
import json

import os
from dotenv import load_dotenv

def get_data_from_db(file_id):

    data = [] 

    try:
        # Loading environment
        load_dotenv()

        # Connect to PostgreSQL
        conn = psycopg2.connect(
            host=os.getenv("DATABASE_HOST"),
            port=os.getenv("DATABASE_PORT"),
            database=os.getenv("DATABASE_NAME"),
            user=os.getenv("DATABASE_USERNAME"),
            password=os.getenv("DATABASE_PASSWORD")
        )


        cursor = conn.cursor()

        # Query
        query = """
        SELECT *
        FROM public.segments
        WHERE public.segments."fileId" = %s;
        """
        cursor.execute(query, (file_id,))

        rows = cursor.fetchall()

        # Print results
        for row in rows:
            # print(row)
            segment_id = row[0]
            bounding_box = row[5]
            bounding_box_alto = [bounding_box['x1'], bounding_box['y1'], bounding_box['x2'], bounding_box['y2']]
            layout_confidence_score = 0.8
            # print(segment_id, bounding_box, layout_confidence_score)

            # Query OCR
            query_ocr = """
            SELECT *
            FROM public.ocr_results
            WHERE public.ocr_results."segmentId" = %s;
            """
            cursor.execute(query_ocr, (segment_id,))

            rows_ocr = cursor.fetchall()

            # print("lines")
            for row_ocr in rows_ocr:
                avg_word_confidence = row_ocr[5]
                lines = row_ocr[6]
                lines_alto = []

                for line in lines: 
                    words = [word['word_text'] for word in line['words']]                    
                    line_alto = " ".join(words) 
                    lines_alto.append(line_alto)

                data. append({
                    "segment_id": segment_id,
                    "bbox": bounding_box_alto,
                    "layout_confidence": layout_confidence_score,
                    "lines": lines_alto
                })

                # print(avg_word_confidence, lines_alto)

        cursor.close()
        conn.close()

        return data

    except Exception as e:
        print("Error while connecting to PostgreSQL:", e)


if __name__ == "__main__":
    file_id = '2680af58-9817-4e54-9a01-f47d6fe02cba'
    data = get_data_from_db(file_id)
    print(data)
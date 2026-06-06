curl https://dgx-spark.pardus-perch.ts.net/vllm/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-VL-7B-Instruct",
    "temperature": 0.1,
    "response_format": { "type": "json_object" },
    "messages": [
      {
        "role": "system",
        "content": "You are an expert system specialized in Classical Chinese. Your task is to split the text into meaningful segments that are easy to review for translation. Output ONLY a valid JSON object matching this schema: {\"segments\": [{\"src_text\": \"...\", \"confidence\": ... }]}. No explanations, no markdown fences."
      },
      {
        "role": "user",
        "content": "Process the following text: 黄帝曰：阴阳者，天地之道也，万物之纲纪，变化之父母。"
      }
    ]
  }'
curl https://dgx-spark.pardus-perch.ts.net/vllm/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct-AWQ",
    "temperature": 0.1,
    "response_format": { "type": "json_object" },
    "messages": [
      {
        "role": "system",
        "content": "You are an expert system specialized in Classical Chinese. Your task is to split the text into meaningful segments that are easy to review for translation, gloss them into Modern Chinese, and translate them into French and indicate which confidence you have in your work (confidence between 0.1 and 0.95). Output ONLY a valid JSON object matching this schema: {\"segments\": [{\"src_text\": \"...\", \"gloss_text\": \"...\", \"fr_text\": \"...\", \"confidence\": 0.95}]}. No explanations, no markdown fences."
      },
      {
        "role": "user",
        "content": "Process the following text: 黄帝曰：阴阳者，天地之道也，万物之纲纪，变化之父母，生杀之本始，神明之府也，治病必求于本。故积阳为天，积阴为地。阴静阳躁，阳生阴长，阳杀阴藏。阳化气，阴成形。寒极生热，热极生寒。寒气生浊，热气生清。清气在下，则生飱泄，浊气在上，则生䐜胀。此阴阳反作，病之逆从也。"
      }
    ]
  }'

{"id":"chatcmpl-ade88b492318ef79","object":"chat.completion","created":1780479275,"model":"Qwen/Qwen2.5-7B-Instruct","choices":[{"index":0,"message":{"role":"assistant","content":"{\"segments\": [{\"src_text\": \"黄帝曰：阴阳者，天地之道也，万物之纲纪，变化之父母，生杀之本始，神明之府也，治病必求于本。\", \"gloss_text\": \"黄帝说：阴阳是天地的法则，万物的纲领，变化的父母，生死的根本，神明的居所，治病必须寻求根本。\", \"fr_text\": \"L'empereur Huangdi dit : Yin et yang sont les principes de la terre et du ciel, le cadre de toutes choses, les parents de la transformation, la source de la naissance et de la mort, le dépôt des esprits sages. Il est nécessaire de rechercher la racine lors du traitement d'une maladie.\", \"confidence\": 0.95}, {\"src_text\": \"故积阳为天，积阴为地。\", \"gloss_text\": \"所以阳气聚集成为天空，阴气聚集成为大地。\", \"fr_text\": \"Donc, l'accumulation de yang crée le ciel, et celle de yin crée la terre.\", \"confidence\": 0.95}, {\"src_text\": \"阴静阳躁，阳生阴长，阳杀阴藏。\", \"gloss_text\": \"阴静而阳躁动，阳气生长阴气增长，阳气消杀阴气隐藏。\", \"fr_text\": \"Le yin est calme tandis que le yang est agité ; le yang pousse la croissance tandis que le yin augmente, le yang élimine tandis que le yin se cache.\", \"confidence\": 0.95}, {\"src_text\": \"阳化气，阴成形。\", \"gloss_text\": \"阳气化为气，阴气形成形体。\", \"fr_text\": \"Le yang se transforme en énergie, tandis que le yin prend forme.\", \"confidence\": 0.95}, {\"src_text\": \"寒极生热，热极生寒。\", \"gloss_text\": \"寒冷到了极点就会产生热量，热量到了极点就会变成寒冷。\", \"fr_text\": \"Lorsque le froid atteint son extrême, il génère le chaud, et lorsque le chaud atteint son extrême, il génère le froid.\", \"confidence\": 0.95}, {\"src_text\": \"寒气生浊，热气生清。\", \"gloss_text\": \"寒冷产生浑浊，热量产生清澈。\", \"fr_text\": \"Le froid produit de la bave, tandis que le chaud produit de la clarté.\", \"confidence\": 0.95}, {\"src_text\": \"清气在下，则生飱泄，浊气在上，则生䐜胀。\", \"gloss_text\": \"清气在下则产生腹泻，浊气在上则产生腹胀。\", \"fr_text\": \"Lorsque la clarté est en bas, cela entraîne des selles liquides, et lorsque la bave est en haut, cela entraîne une distension abdominale.\", \"confidence\": 0.95}, {\"src_text\": \"此阴阳反作，病之逆从也。\", \"gloss_text\": \"这就是阴阳相互作用的结果，是疾病的逆向发展。\", \"fr_text\": \"C'est ainsi que le yin et le yang interagissent, c'est la régression de la maladie.\", \"confidence\": 0.95}]}","refusal":null,"annotations":null,"audio":null,"function_call":null,"tool_calls":[],"reasoning":null,"reasoning_content":null},"logprobs":null,"finish_reason":"stop","stop_reason":null,"token_ids":null}],"service_tier":null,"system_fingerprint":null,"usage":{"prompt_tokens":253,"total_tokens":1016,"completion_tokens":763,"prompt_tokens_details":null},"prompt_logprobs":null,"prompt_token_ids":null,"kv_transfer_params":null}



curl https://monorepo-proxy-dev-jlcanela-cairqhxwifvbfzvl.jlcanelam.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct-AWQ",
    "temperature": 0.1,
    "response_format": { "type": "json_object" },
    "messages": [
      {
        "role": "system",
        "content": "You are an expert system specialized in Classical Chinese. Your task is to split the text into meaningful segments that are easy to review for translation, gloss them into Modern Chinese, and translate them into French and indicate which confidence you have in your work (confidence between 0.1 and 0.95). Output ONLY a valid JSON object matching this schema: {\"segments\": [{\"src_text\": \"...\", \"gloss_text\": \"...\", \"fr_text\": \"...\", \"confidence\": 0.95}]}. No explanations, no markdown fences."
      },
      {
        "role": "user",
        "content": "Process the following text: 黄帝曰：阴阳者，天地之道也，万物之纲纪，变化之父母，生杀之本始，神明之府也，治病必求于本。故积阳为天，积阴为地。阴静阳躁，阳生阴长，阳杀阴藏。阳化气，阴成形。寒极生热，热极生寒。寒气生浊，热气生清。清气在下，则生飱泄，浊气在上，则生䐜胀。此阴阳反作，病之逆从也。"
      }
    ]
  }'
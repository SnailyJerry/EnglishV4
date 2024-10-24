import axios from 'axios';

const API_KEY = 'b82d3934ce31e2339617905d0022ce19.1rxFSnsPkbuRAMbG';
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RecognizedWord {
  word: string;
  translation: string;
  box: BoundingBox;
  confidence: number;
  position: string;
  exampleSentence?: {
    english: string;
    chinese: string;
  };
}

const formatWord = (word: string): string => {
  return word.toLowerCase().replace(/_/g, ' ');
};

export const recognizeImage = async (imageDataUrl: string): Promise<RecognizedWord[]> => {
  try {
    const base64Image = imageDataUrl.includes('base64,') 
      ? imageDataUrl 
      : `data:image/jpeg;base64,${imageDataUrl}`;

    const response = await axios.post(
      API_URL,
      {
        model: 'glm-4v-plus',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: base64Image
                }
              },
              {
                type: 'text',
                text: `请仔细观察并分析图片的每个区域，包括主要物品、背景物品和细节装饰。识别图片中的重要物体，并提供以下信息：

1. 观察要求：
- 仔细扫描图片的每个区域（上方、中部、下方、左右两侧）
- 优先识别画面中心和主要区域的物体
- 其次识别具有教育意义的日常用品和玩具
- 最后识别有助于场景描述的环境元素
- 相似物体要分别识别（如不同的玩具）

2. 位置描述要求：
使用以下标准方位词之一：
- 左上角边缘、右上角靠近边缘
- 左下角内侧、右下角外侧
- 中央偏左、中央偏右
- 上方靠左、上方靠右
- 下方偏左、下方偏右
- 左侧边缘、右侧边缘
- 中央靠上、中央靠下
- 正中稍微偏右
- 左侧中央靠下、右侧中央靠上

3. 边界框信息：
- x, y: 物体边界框左上角的坐标（0-100%）
- width, height: 边界框的宽度和高度（0-100%）

4. 物体信息：
- 英文名称（使用最准确的英文单词）
- 中文翻译（准确的中文翻译）
- 识别置信度（0-1之间）
- 为每个识别的物体生成一个例句，要求如下：
  * 句子必须与图片中的实际场景相关
  * 句子长度控制在5-8个单词
  * 只使用简单现在时或现在进行时
  * 必须包含被识别的目标单词
  * 使用2-6岁儿童日常对话中的表达
  * 优先使用 I, you, we, this, that 等简单代词
  * 避免从句和复杂句式
  * 中文翻译要口语化，适合亲子对话

请用以下JSON格式返回：
[
  {
    "word": "物体英文名",
    "translation": "中文翻译",
    "box": {
      "x": 左上角x坐标（0-100）,
      "y": 左上角y坐标（0-100）,
      "width": 宽度（0-100）,
      "height": 高度（0-100）
    },
    "confidence": 置信度（0-1）,
    "position": "位置描述（使用规定的方位词）",
    "exampleSentence": {
      "english": "包含该单词的实用例句",
      "chinese": "例句中文翻译"
    }
  }
]`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      try {
        const content = response.data.choices[0].message.content;
        
        if (typeof content === 'string') {
          const cleanContent = content.trim().replace(/^```json\n|\n```$/g, '');
          const words = JSON.parse(cleanContent);
          if (Array.isArray(words)) {
            return words
              .filter(word => word.confidence >= 0.2)
              .slice(0, 10)
              .map(word => ({
                word: formatWord(String(word.word)),
                translation: String(word.translation),
                box: {
                  x: Math.min(100, Math.max(0, Number(word.box.x))),
                  y: Math.min(100, Math.max(0, Number(word.box.y))),
                  width: Math.min(100, Math.max(0, Number(word.box.width))),
                  height: Math.min(100, Math.max(0, Number(word.box.height)))
                },
                confidence: Number(word.confidence),
                position: String(word.position),
                exampleSentence: word.exampleSentence ? {
                  english: String(word.exampleSentence.english),
                  chinese: String(word.exampleSentence.chinese)
                } : undefined
              }));
          }
        }
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        console.log('Raw content:', response.data.choices[0].message.content);
      }
    }
    
    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    } else {
      console.error('Error recognizing image:', error);
    }
    return [];
  }
};
const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEN_API_KEY);
const cors = require('cors')({
    origin: true, // 모든 origin 허용. 필요에 따라 특정 origin만 허용하도록 설정할 수 있음
});
exports.interactWithGemini = functions.https.onCall(async (data, context) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const userResponse = data.userResponse;

        // 기존 프롬프트 가져오기 (데이터베이스, 파일 등에서)
        const initialPrompt = `
당신은 0~7세 아동의 언어 발달을 돕는 언어 치료사를 위한 유능한 조력자입니다. 
아래에 주어진 정보를 바탕으로, 각 언어 능력 영역별로 아이들이 흥미를 느끼고 적극적으로 참여할 수 있는 다양한 교구 활동 아이디어를 제시해 주세요. 
각 교구 활동 아이디어는 아래의 형식에 맞춰 상세하게 작성되어야 합니다.

**교구 정보:**
* **이름:** 교구의 이름 (예: ${keywords.join(', ')} 그림 카드)
* **학습 목표:** 이 교구를 통해 아이들이 향상시킬 수 있는 구체적인 언어 능력 목표 (최소 2개 이상) (예: 어휘력 확장, 문장 구조 이해)
* **필요한 재료:** 교구 제작에 필요한 모든 재료를 상세하게 나열 (예: 색지, 가위, 풀, 그림 자료 등)
* **제작 방법:** 교구를 만드는 과정을 단계별로 자세하게 설명 (그림 자료 첨부 시 더욱 효과적)
* **활동 지침:** 아이들과 함께 교구를 활용하는 방법을 구체적으로 제시 (최소 3가지 이상의 활동 예시 포함)
* **참고 자료:** 해당 교구 활동과 관련된 추가적인 정보나 자료 (예: 관련 도서, 웹사이트, 학술 자료 등)

**참고 사항:**
* 아이들의 연령대 (0~7세)를 고려하여 안전하고 적절한 재료와 활동을 제안해 주세요.
* 각 교구 활동은 아이들의 흥미를 유발하고 참여도를 높일 수 있도록 창의적이고 다양하게 구성해 주세요.
* 교구 제작 방법과 활동 지침은 누구나 쉽게 이해하고 따라 할 수 있도록 명확하고 상세하게 작성해 주세요.
* 필요한 경우 그림 자료나 사진을 첨부하여 설명을 보완해 주세요.
* 각 교구 활동 아이디어는 최소 300자 이상으로 작성해 주세요.

**주의 사항:**
* 본 지시사항에 명시되지 않은 내용은 포함하지 마세요.
* 제시된 형식과 내용에 맞춰 정확하고 간결하게 작성해 주세요.
`;


        // 유저 답변과 함께 프롬프트 구성
        const prompt = `${initialPrompt}\n\n사용자: ${userResponse}\nGemini:`;

        const result = await model.generateContent(prompt);
        const geminiResponse = await result.response;
        const text = geminiResponse.text();

        return { geminiResponse: text };

    } catch (error) {
        console.error('Error interacting with Gemini:', error);
        throw new functions.https.HttpsError('internal', 'Gemini API 호출 중 오류 발생');
    }
});
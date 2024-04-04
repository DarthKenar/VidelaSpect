import { HfInference } from "@huggingface/inference";
import { Image } from "../interfaces/interfaces";

export const getImageClassification = async (data:Image|undefined) => {
    if (data) {
        let blob = new Blob([data.buffer], { type: 'image/jpeg' });
        let model = "openai/clip-vit-large-patch14-336"
        const hf = new HfInference(process.env.HF_TOKEN_KEY)
        let scores = await hf.zeroShotImageClassification({
            model: model,
            inputs: {
                image: blob
            },  
            parameters: {
                candidate_labels: ['Human Face', 'Inanimate Object', 'Empty Place']
            }
            })
        console.log(scores)
        return scores
    }

}

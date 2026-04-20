import axios from "axios";

export const validateContract = async (file: File, chain: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("chain", chain);

    const response = await axios.post(
        "http://localhost:3000/api/validate",
        formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
        }
    );

    return response.data;
};

export const checkHealth = async (): Promise<boolean> => {
    try {
        const res = await axios.get("http://localhost:3000/api/health", { timeout: 3000 });
        return res.data?.status === "running";
    } catch {
        return false;
    }
};
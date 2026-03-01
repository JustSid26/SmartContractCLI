import axios from "axios";

export const validateContract = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
        "http://localhost:3000/api/validate",
        formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
        }
    );

    return response.data;
};

'use server';
/**
 * @fileOverview An AI assistant for the Currency Clarity app.
 *
 * - askAI - A function that handles chat interactions.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const readmeContent = `
# Ứng dụng Quản lý Giao dịch Tiền tệ - Currency Clarity (NMHMIHI)

Đây là tài liệu mô tả về ứng dụng web "Currency Clarity", dùng để theo dõi giao dịch TWD và VND.

## Các Tính năng Chính:
- Thiết lập tỷ giá hối đoái chung.
- Quản lý danh sách giao dịch (Thêm, Sửa, Xóa).
- Tính toán tổng tiền TWD, VND và Phí.
- Chức năng "Thử nghiệm trên mục đã chọn": Cho phép nhập một tỷ giá giả định để xem tổng VND thay đổi thế nào so với thực tế của các giao dịch đang chọn.
- So sánh: Nếu kết quả thử nghiệm thấp hơn thực tế, chênh lệch sẽ hiện màu đỏ.
- Chức năng Đánh dấu giao dịch để phân loại.
- Khôi phục giao dịch vừa xóa.
- Reset toàn bộ dữ liệu.
`;

const ChatHistorySchema = z.array(
    z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
    })
);

const chatFlow = ai.defineFlow(
    {
        name: 'chatFlow',
        inputSchema: ChatHistorySchema,
        outputSchema: z.string(),
    },
    async (history) => {
        const messages = history.map(h => ({
            role: h.role,
            content: [{ text: h.content }]
        }));

        const response = await ai.generate({
            model: 'googleai/gemini-1.5-flash-latest',
            system: `Bạn là một trợ lý AI hữu ích cho ứng dụng "Currency Clarity". Hãy trả lời các câu hỏi của người dùng dựa trên thông tin sau đây về ứng dụng. Hãy luôn trả lời bằng tiếng Việt ngắn gọn và chính xác.\n\n${readmeContent}`,
            messages: messages,
        });

        return response.text;
    }
);

export async function askAI(history: z.infer<typeof ChatHistorySchema>): Promise<string> {
    return await chatFlow(history);
}

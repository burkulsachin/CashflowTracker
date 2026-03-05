'use server';
/**
 * @fileoverview A flow that suggests a transaction category based on its description.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestCategoryInputSchema = z.object({
  description: z.string().describe('The description of the transaction (e.g., "Starbucks Coffee").'),
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      kind: z.enum(['income', 'expense']),
    })
  ).describe('The list of available categories to choose from.'),
   type: z.enum(['income', 'expense']).describe('The type of transaction.'),
});
export type SuggestCategoryInput = z.infer<typeof SuggestCategoryInputSchema>;

const SuggestCategoryOutputSchema = z.object({
  categoryId: z.string().optional().describe('The ID of the suggested category. Can be undefined if no suggestion is made.'),
});
export type SuggestCategoryOutput = z.infer<typeof SuggestCategoryOutputSchema>;


const prompt = ai.definePrompt({
    name: 'suggestCategoryPrompt',
    input: { schema: SuggestCategoryInputSchema },
    output: { schema: SuggestCategoryOutputSchema },
    prompt: `You are a personal finance assistant. Your task is to suggest the most appropriate category for a transaction based on its description.

    Transaction Description: "{{description}}"
    Transaction Type: "{{type}}"

    Here are the available categories:
    {{#each categories}}
    - ID: {{id}}, Name: {{name}}, Type: {{kind}}
    {{/each}}

    Analyze the transaction description and select the best matching category ID from the list. The category type must match the transaction type.
    If no category is a good match, you can return an undefined categoryId.
    Return only the JSON object with the suggested categoryId.`,
});


export const suggestTransactionCategoryFlow = ai.defineFlow(
  {
    name: 'suggestTransactionCategoryFlow',
    inputSchema: SuggestCategoryInputSchema,
    outputSchema: SuggestCategoryOutputSchema,
  },
  async (input) => {
    const relevantCategories = input.categories.filter(c => c.kind === input.type);
    if (relevantCategories.length === 0) {
      return { categoryId: undefined };
    }

    const {output} = await prompt({...input, categories: relevantCategories});
    return output!;
  }
);


export async function suggestTransactionCategory(input: SuggestCategoryInput): Promise<SuggestCategoryOutput> {
    return await suggestTransactionCategoryFlow(input);
}

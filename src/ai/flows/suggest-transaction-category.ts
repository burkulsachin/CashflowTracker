'use server';
/**
 * @fileOverview This file defines a Genkit flow for intelligently suggesting transaction categories.
 *
 * - suggestTransactionCategory - A function that suggests a category for a given transaction.
 * - SuggestTransactionCategoryInput - The input type for the suggestTransactionCategory function.
 * - SuggestTransactionCategoryOutput - The return type for the suggestTransactionCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema for the flow and prompt
const SuggestTransactionCategoryInputSchema = z.object({
  transactionAmount: z.number().describe('The amount of the transaction in minor units (e.g., cents).'),
  transactionDescription: z.string().describe('A brief description of the transaction.'),
  transactionMerchant: z.string().optional().describe('The merchant or payee of the transaction, if available.'),
  transactionDateISO: z.string().datetime().describe('The ISO 8601 formatted date of the transaction.'),
  existingCategories: z.array(z.object({
    id: z.string().describe('The unique ID of the category.'),
    name: z.string().describe('The name of the category.'),
    kind: z.enum(['income', 'expense']).describe('Whether the category is for income or expense.'),
    isArchived: z.boolean().describe('Whether the category is archived and should not be used for new transactions.'),
  })).describe('A list of all available categories, including archived ones. The model will only consider non-archived categories for suggestions.'),
});
export type SuggestTransactionCategoryInput = z.infer<typeof SuggestTransactionCategoryInputSchema>;

// Output Schema for the suggested category
const SuggestTransactionCategoryOutputSchema = z.object({
  suggestedCategoryId: z.string().describe('The unique ID of the most appropriate active category for the transaction.'),
  confidenceScore: z.number().min(0).max(1).describe('A score from 0.0 to 1.0 indicating the confidence in the suggested category. Higher is better.'),
});
export type SuggestTransactionCategoryOutput = z.infer<typeof SuggestTransactionCategoryOutputSchema>;

const prompt = ai.definePrompt({
  name: 'suggestTransactionCategoryPrompt',
  input: {schema: SuggestTransactionCategoryInputSchema},
  output: {schema: SuggestTransactionCategoryOutputSchema},
  prompt: `You are an expert financial assistant tasked with intelligently suggesting a category for a given transaction.
Analyze the transaction details and select the single best matching category from the provided list of active categories.
The suggested category must be one of the 'id's from the 'existingCategories' list where 'isArchived' is 'false'.
If no suitable active category is found, you should still attempt to suggest the closest match from the provided active categories.

Transaction Details:
- Amount: {{{transactionAmount}}}
- Description: {{{transactionDescription}}}
{{#if transactionMerchant}}- Merchant: {{{transactionMerchant}}}{{/if}}
- Date: {{{transactionDateISO}}}

Available Active Categories:
{{#each existingCategories}}
{{#unless this.isArchived}}
- ID: {{{this.id}}}, Name: {{{this.name}}}, Type: {{{this.kind}}}
{{/unless}}
{{/each}}

Based on the transaction details, provide the 'id' of the most appropriate active category and a 'confidenceScore' between 0.0 and 1.0 (1.0 being highly confident, 0.0 being very uncertain).`,
});

const suggestTransactionCategoryFlow = ai.defineFlow(
  {
    name: 'suggestTransactionCategoryFlow',
    inputSchema: SuggestTransactionCategoryInputSchema,
    outputSchema: SuggestTransactionCategoryOutputSchema,
  },
  async (input) => {
    // The prompt template already filters categories based on isArchived, so we can directly pass the input.
    const {output} = await prompt(input);
    return output!;
  }
);

export async function suggestTransactionCategory(
  input: SuggestTransactionCategoryInput
):
Promise<SuggestTransactionCategoryOutput> {
  return suggestTransactionCategoryFlow(input);
}

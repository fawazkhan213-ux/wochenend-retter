# Wochenend-Retter

A web application designed to help users prepare for the weekend by managing shopping lists and identifying products they regularly purchase.

## 📌 Overview

Wochenend-Retter helps users keep track of their shopping needs and avoid forgetting regularly purchased products.

The application records products that users add to their shopping lists and mark as purchased. After a product has been purchased repeatedly across multiple shopping lists, the application identifies it as a recurring item and recommends it when the user creates a new shopping list.

## 🧠 Recommendation Algorithm

The application uses a rule-based recommendation system rather than an external AI service.

The basic process is:

1. A user adds a product to a shopping list.
2. The user marks the product as purchased.
3. The purchase is recorded.
4. The system tracks repeated purchases of the same product.
5. After the product reaches the defined repetition threshold, it is recognized as a recurring item.
6. When the user creates a new shopping list, the recurring product can be recommended automatically.

### Example

```text
Shopping List 1
☑ Milk

Shopping List 2
☑ Milk

Shopping List 3
☑ Milk
        ↓
Milk is identified as a recurring purchase
        ↓
New Shopping List

💡 Recommended: Milk

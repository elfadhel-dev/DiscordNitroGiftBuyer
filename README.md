# Discord Nitro Gift Buyer Script

This project is a **Discord Nitro Gift Buyer** script, which automates the process of checking, validating, and purchasing Discord Nitro gifts using a list of tokens. The script can be used for bulk purchasing and managing Discord Nitro subscriptions (both basic and boost) for multiple user accounts.

## Key Features:
- **Token Validation**: It checks a list of provided Discord tokens to determine their validity and whether they are phone-locked, invalid, or rate-limited.
- **Payment Method Detection**: The script verifies if the valid tokens are associated with payment methods (e.g., credit cards, PayPal) and tracks them.
- **Proxy Support**: Optional use of proxies to prevent rate-limiting or blocking by Discord's API when making requests.
- **Gift Purchase Automation**: Once valid tokens with associated payment methods are found, the script automates the purchase of Discord Nitro gifts, either Basic or Boost, depending on the user’s input.
- **Error Handling**: It gracefully handles errors, retries when rate-limited, and logs various responses to keep track of the script’s progress.
- **Logging**: Provides detailed logging to the console, showing the status of each token, including whether the purchase was successful or if there was any failure.

## Flow:
1. **Token Input**: The user provides a list of Discord tokens (from which the script will attempt to purchase Nitro gifts).
2. **Validation**: The script checks the tokens, categorizing them into valid, invalid, or phone-locked tokens.
3. **Payment Methods**: It identifies tokens with valid payment methods (like credit cards) associated with them.
4. **Purchase**: For tokens that are valid and have payment methods, the script automates the purchase of the desired Discord Nitro gift.

## Intended Use:
This tool is intended for users or developers who want to manage multiple Discord accounts or purchase Discord Nitro gifts in bulk using automation. It is important to note that this type of automation could violate Discord's terms of service, and users should proceed with caution.

## Technologies:
- **Node.js**: This script is written in JavaScript using Node.js for executing HTTP requests and handling asynchronous logic.
- **Axios**: Used for making HTTP requests to Discord's API to validate tokens and perform purchases.
- **File System (fs)**: For reading and writing data, such as tokens, proxies, and Nitro gift codes.
- **Prompt-sync**: Used for prompting the user to input details like the type of Nitro and the duration.

## Disclaimer:
The use of this script to automate purchases on Discord is not endorsed by Discord and could potentially lead to account bans or other penalties. Ensure you are in compliance with Discord’s Terms of Service and use this script responsibly.

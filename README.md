# HustleWrite AI — Hacktoberfest 2026 Side Hustle

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12).*

## What I Built

**HustleWrite AI** is a local-AI-powered product listing generator designed for small business owners, freelancers, Instagram sellers, WhatsApp shops, and online marketplace vendors.

Users enter basic product information—such as the product name, category, price, features, target audience, tone, language, and selling platform—and HustleWrite AI helps turn it into ready-to-edit marketing content, including:

- An SEO-friendly product title
- A product description
- Key selling points
- A social media caption
- Search keywords and hashtags
- A call to action

The goal is to reduce the time small sellers spend writing product listings and promotional content. It could be useful to independent sellers who need an affordable, straightforward way to prepare product copy.

## Demo

- **Live demo:** [Add your deployed URL, if available]
- **Video demo:** [Add your demo video URL]

If the app is currently running locally, replace this section with a short screen-recording link showing the real generation flow.

## Code

- **GitHub repository:** [Add your public GitHub repository URL]

The repository should include the source code, setup instructions, an `.env.example` file, and the project license.

## How I Built It

HustleWrite AI is designed with the following stack:

- **Frontend:** React, Vite, and TypeScript
- **Backend:** Node.js, Express, and TypeScript
- **Local AI inference:** Ollama with the `qwen2.5:1.5b` model
- **Validation:** Zod or equivalent request/output validation
- **Testing:** Vitest for essential application tests

The frontend collects product details and sends them to the backend. The backend validates the input, calls the local Ollama API, checks the generated response, and returns structured listing content for the user to review and edit.

**Note:** Keep only the technologies and features that are implemented and tested in your final repository. If a feature is still in progress, describe it as planned rather than completed.

## Why Does Open Innovation Matter?

Open-weight AI makes this project more flexible and accessible. By running the model locally through Ollama, HustleWrite AI can generate content without sending product details to a third-party AI API. Once the software and model are downloaded, local generation can work without an internet connection, as long as the local model and application are running.

This approach can also avoid per-request charges from a hosted AI API and lets users switch between compatible local models. It offers more control over how the application works and reduces dependence on one commercial provider.

Local inference still uses the computer's memory, storage, processing power, and electricity. Model licenses vary, so users should review the selected model's terms before commercial use. The privacy claim should also be verified against the complete application to ensure no data is sent elsewhere.

## My Agent Session

[Optional: Add your DevRelay agent session link or embed it using the format required by the challenge.]

## My First User

[Optional: If someone has tried HustleWrite AI, describe who they are, what task they used it for, and their honest feedback. Mention payment only if they actually paid. Remove this section if you do not have a real user story.]

## Prize Categories

[Check the official challenge page and list only the partner prize categories that apply to your submission. Remove this section if none apply.]

---

### Before submitting

- [ ] Replace the demo placeholders with a real video or deployed link.
- [ ] Add your public GitHub repository URL.
- [ ] Test that listing generation uses the local Ollama model rather than mock output.
- [ ] Verify the README setup instructions on a clean environment if possible.
- [ ] Confirm the project license and the selected model's license.
- [ ] Add real user feedback only if you have it.
- [ ] Review the official challenge rules and submission requirements.

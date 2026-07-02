This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
## Architecture and Working
### Overview
The Jackie Jeans Quiz application is built using the Next.js framework, leveraging its powerful features such as server-side rendering (SSR) and API routes. The app is designed to provide users with a personalized experience to find their perfect jeans fit by answering a series of questions.
### Folder Structure
├── app
│   ├── api
│   │   └── tts
│   │       └── route.js  # API route for text-to-speech functionality
│   ├── layout.js         # Root layout for the application
│   └── page.js           # Main page of the application
├── components            # Reusable React components
│   ├── BrandSizeEntry.js # Component for selecting brand sizes
│   ├── DropdownSelect.js # Component for dropdown selection
│   ├── MultiSelect.js    # Component for multi-select options
│   └── NumberInput.js    # Component for numeric input
├── context
│   └── QuizContext.js    # Context provider for managing quiz state
├── styles
│   └── globals.css       # Global CSS styles
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md             # Project documentation
### Key Features
- **Quiz Functionality**: Users answer a series of questions to get a personalized denim recommendation.
- **Text-to-Speech API**: Uses Deepgram API to convert text to speech for accessibility.
- **Responsive Design**: Styled with Tailwind CSS for a seamless experience across devices.
### Workflow
1. **User Interaction**: Users interact with the app through various input components like dropdowns, multi-selects, and number inputs.
2. **State Management**: The `QuizContext` manages the state of the quiz and user inputs.
3. **API Integration**: The `/api/tts/route.js` handles requests to the Deepgram API for text-to-speech functionality.
4. **Dynamic Rendering**: The app leverages Next.js features like server-side rendering and dynamic routing to deliver a fast and responsive user experience.

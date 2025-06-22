import { PortableTextBlock } from '@portabletext/types';

// Sample lesson using the new schema structure
export const sampleLesson = {
  _id: 'lesson-building-credit-basics',
  title: 'Building Credit from Scratch',
  slug: 'building-credit-basics',
  type: 'reading',
  duration: '20 min',
  order: 1,
  
  // Introduction section
  introduction: [
    {
      _type: 'block',
      style: 'normal',
      _key: 'intro-1',
      children: [
        {
          _type: 'span',
          text: 'Building credit in the U.S. is essential for your financial future. This lesson will guide you through practical steps to establish credit from scratch, even as a newcomer to America.',
          _key: 'intro-span-1'
        }
      ],
      markDefs: []
    }
  ],
  
  // Measurable deliverables (formerly learning objectives)
  measurableDeliverables: [
    {
      _key: 'deliverable-1',
      description: [
        {
          _type: 'block',
          style: 'normal',
          _key: 'del-1-block',
          children: [
            {
              _type: 'span',
              text: 'Compare at least 3 secured credit card options and identify which one best fits your situation',
              _key: 'del-1-span'
            }
          ],
          markDefs: []
        }
      ],
      isOptional: false
    },
    {
      _key: 'deliverable-2',
      description: [
        {
          _type: 'block',
          style: 'normal',
          _key: 'del-2-block',
          children: [
            {
              _type: 'span',
              text: 'Create a credit-building plan with specific monthly payment amounts and due dates',
              _key: 'del-2-span'
            }
          ],
          markDefs: []
        }
      ],
      isOptional: false
    },
    {
      _key: 'deliverable-3',
      description: [
        {
          _type: 'block',
          style: 'normal',
          _key: 'del-3-block',
          children: [
            {
              _type: 'span',
              text: 'Set up automatic payments for your credit card to avoid missed payments',
              _key: 'del-3-span'
            }
          ],
          markDefs: []
        }
      ],
      isOptional: true
    }
  ],
  
  // Main content
  content: [
    {
      _type: 'block',
      style: 'h2',
      _key: 'content-h2-1',
      children: [
        {
          _type: 'span',
          text: 'Understanding Credit in America',
          _key: 'content-h2-1-span'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'content-p-1',
      children: [
        {
          _type: 'span',
          text: 'Your credit score is a number between 300-850 that lenders use to determine your creditworthiness. As a newcomer, you start with no credit history, which makes it difficult to rent apartments, get loans, or even sign up for utilities without large deposits.',
          _key: 'content-p-1-span'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'h3',
      _key: 'content-h3-1',
      children: [
        {
          _type: 'span',
          text: 'The Five Credit Score Factors',
          _key: 'content-h3-1-span'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'content-p-2',
      children: [
        {
          _type: 'span',
          text: '1. Payment History (35%): Making payments on time',
          _key: 'content-p-2-span-1'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'content-p-3',
      children: [
        {
          _type: 'span',
          text: '2. Credit Utilization (30%): How much of your available credit you use',
          _key: 'content-p-3-span-1'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'content-p-4',
      children: [
        {
          _type: 'span',
          text: '3. Length of Credit History (15%): How long you\'ve had credit accounts',
          _key: 'content-p-4-span-1'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'content-p-5',
      children: [
        {
          _type: 'span',
          text: '4. Credit Mix (10%): Having different types of credit accounts',
          _key: 'content-p-5-span-1'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'content-p-6',
      children: [
        {
          _type: 'span',
          text: '5. New Credit (10%): Recently opened accounts and credit inquiries',
          _key: 'content-p-6-span-1'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'h2',
      _key: 'content-h2-2',
      children: [
        {
          _type: 'span',
          text: 'Practical Credit-Building Options',
          _key: 'content-h2-2-span'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'content-p-7',
      children: [
        {
          _type: 'span',
          text: 'Here are the most effective ways to build credit as a newcomer:',
          _key: 'content-p-7-span'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'h3',
      _key: 'content-h3-2',
      children: [
        {
          _type: 'span',
          text: 'Secured Credit Cards',
          _key: 'content-h3-2-span'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'content-p-8',
      children: [
        {
          _type: 'span',
          text: 'A secured credit card requires a security deposit that typically becomes your credit limit. This deposit reduces the risk for the card issuer, making these cards accessible to people with no credit history.',
          _key: 'content-p-8-span'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'h3',
      _key: 'content-h3-3',
      children: [
        {
          _type: 'span',
          text: 'Credit Builder Loans',
          _key: 'content-h3-3-span'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'content-p-9',
      children: [
        {
          _type: 'span',
          text: 'These special loans are designed specifically for building credit. The money you "borrow" is held in a bank account while you make payments. Once you\'ve paid in full, you receive the money back, minus any fees.',
          _key: 'content-p-9-span'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'h3',
      _key: 'content-h3-4',
      children: [
        {
          _type: 'span',
          text: 'Become an Authorized User',
          _key: 'content-h3-4-span'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'content-p-10',
      children: [
        {
          _type: 'span',
          text: 'If you have a trusted friend or family member with good credit, ask to be added as an authorized user on their credit card. Their positive payment history can help build your credit, even if you don\'t use the card.',
          _key: 'content-p-10-span'
        }
      ],
      markDefs: []
    }
  ],
  
  // Key takeaways
  keyTakeaways: [
    {
      _type: 'block',
      style: 'normal',
      _key: 'takeaway-1',
      children: [
        {
          _type: 'span',
          text: 'Pay all bills on time - even one late payment can significantly damage your credit score',
          _key: 'takeaway-1-span'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'takeaway-2',
      children: [
        {
          _type: 'span',
          text: 'Keep credit utilization below 30% - using $300 or less of a $1,000 credit limit',
          _key: 'takeaway-2-span'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'takeaway-3',
      children: [
        {
          _type: 'span',
          text: 'Start with a secured card, then graduate to an unsecured card after 6-12 months of responsible use',
          _key: 'takeaway-3-span'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'takeaway-4',
      children: [
        {
          _type: 'span',
          text: 'Avoid applying for multiple credit cards at once, as each application can temporarily lower your score',
          _key: 'takeaway-4-span'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'takeaway-5',
      children: [
        {
          _type: 'span',
          text: 'Be patient - building good credit takes time, but consistent responsible behavior will pay off',
          _key: 'takeaway-5-span'
        }
      ],
      markDefs: []
    }
  ],
  
  // Reflection prompts
  reflectionPrompts: [
    {
      _type: 'block',
      style: 'normal',
      _key: 'reflection-1',
      children: [
        {
          _type: 'span',
          text: 'What specific concerns do you have about building credit in the U.S.?',
          _key: 'reflection-1-span'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'reflection-2',
      children: [
        {
          _type: 'span',
          text: 'Which secured credit card features are most important for your situation?',
          _key: 'reflection-2-span'
        }
      ],
      markDefs: []
    },
    {
      _type: 'block',
      style: 'normal',
      _key: 'reflection-3',
      children: [
        {
          _type: 'span',
          text: 'How will you ensure you never miss a payment?',
          _key: 'reflection-3-span'
        }
      ],
      markDefs: []
    }
  ],
  
  // Actionable tasks (formerly action items)
  actionableTasks: [
    {
      _key: 'task-1',
      description: [
        {
          _type: 'block',
          style: 'normal',
          _key: 'task-1-block',
          children: [
            {
              _type: 'span',
              text: 'Research and compare at least 3 secured credit cards (Discover It Secured, Capital One Secured, and Citi Secured Mastercard are good options)',
              _key: 'task-1-span'
            }
          ],
          markDefs: []
        }
      ],
      isOptional: false
    },
    {
      _key: 'task-2',
      description: [
        {
          _type: 'block',
          style: 'normal',
          _key: 'task-2-block',
          children: [
            {
              _type: 'span',
              text: 'Apply for a secured credit card with a deposit you can afford (typically $200-$500)',
              _key: 'task-2-span'
            }
          ],
          markDefs: []
        }
      ],
      isOptional: false
    },
    {
      _key: 'task-3',
      description: [
        {
          _type: 'block',
          style: 'normal',
          _key: 'task-3-block',
          children: [
            {
              _type: 'span',
              text: 'Create a budget spreadsheet that includes your credit card payment due date and minimum payment amount',
              _key: 'task-3-span'
            }
          ],
          markDefs: []
        }
      ],
      isOptional: false
    },
    {
      _key: 'task-4',
      description: [
        {
          _type: 'block',
          style: 'normal',
          _key: 'task-4-block',
          children: [
            {
              _type: 'span',
              text: 'Set up automatic payments through your bank account to ensure on-time payments',
              _key: 'task-4-span'
            }
          ],
          markDefs: []
        }
      ],
      isOptional: true
    },
    {
      _key: 'task-5',
      description: [
        {
          _type: 'block',
          style: 'normal',
          _key: 'task-5-block',
          children: [
            {
              _type: 'span',
              text: 'Sign up for a free credit monitoring service like Credit Karma to track your progress',
              _key: 'task-5-span'
            }
          ],
          markDefs: []
        }
      ],
      isOptional: true
    }
  ],
  
  // Resources
  lessonResources: [
    {
      title: "Secured Credit Card Comparison Tool",
      description: "Interactive tool to compare secured credit card options",
      url: "https://www.nerdwallet.com/best/credit-cards/secured",
      type: "external"
    },
    {
      title: "Credit Building Budget Template",
      description: "Downloadable spreadsheet to track credit payments",
      url: "https://example.com/credit-budget-template.xlsx",
      type: "download"
    },
    {
      title: "Credit Karma",
      description: "Free credit score monitoring service",
      url: "https://www.creditkarma.com",
      type: "external"
    }
  ],
  
  // Quiz data
  quiz: {
    title: "Credit Building Knowledge Check",
    questions: [
      {
        questionText: "What is the most important factor in your credit score?",
        questionType: "multipleChoice",
        options: [
          { text: "Payment history", isCorrect: true },
          { text: "Credit utilization", isCorrect: false },
          { text: "Length of credit history", isCorrect: false },
          { text: "Credit mix", isCorrect: false }
        ],
        feedback: "Payment history accounts for 35% of your credit score and is the most important factor."
      },
      {
        questionText: "What is an ideal credit utilization ratio?",
        questionType: "multipleChoice",
        options: [
          { text: "Below 10%", isCorrect: false },
          { text: "Below 30%", isCorrect: true },
          { text: "Below 50%", isCorrect: false },
          { text: "Below 70%", isCorrect: false }
        ],
        feedback: "Keeping your credit utilization below 30% is generally recommended for a good credit score."
      },
      {
        questionText: "A secured credit card requires a security deposit.",
        questionType: "trueFalse",
        correctAnswer: true,
        feedback: "Correct! A secured credit card requires a security deposit that typically becomes your credit limit."
      },
      {
        questionText: "You're planning to apply for an apartment rental next month. What's the best approach for building credit quickly?",
        questionType: "multipleChoice",
        options: [
          { text: "Apply for multiple credit cards at once", isCorrect: false },
          { text: "Get a secured card and make small purchases with on-time payments", isCorrect: true },
          { text: "Take out a large loan to show you can handle debt", isCorrect: false },
          { text: "Max out a credit card to show active usage", isCorrect: false }
        ],
        feedback: "Building credit takes time. For a near-term apartment application, get a secured card, use it responsibly, and consider asking if the landlord will accept alternative proof of payment reliability like utility or rent payment history."
      }
    ]
  },
  
  // Module reference
  module: {
    _id: "module-credit-building",
    title: "Building Credit in America",
    order: 2
  }
};
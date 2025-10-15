import faqsData from '@/app/data/faqs.json';
import resultsData from '@/app/data/results.json';

interface FAQ {
  question: string[];
  answer: string;
}

interface ResultData {
  winner: string;
  runnerUp?: string;
  status: string;
}

interface Results {
  [key: string]: ResultData;
}

export interface EventCardData {
  icon: string;
  title: string;
  venue: string;
  time: string;
  color: string;
  query: string;
}

export interface ResultCardData {
  icon: string;
  title: string;
  winner: string;
  runnerUp?: string;
  status: string;
  color: string;
  isPending?: boolean;
}

export interface ContactCardData {
  email: string;
  website: string;
  mobile: string;
  facultyCoordinators: { name: string; phone: string }[];
  studentCoordinators: { name: string; phone: string }[];
}

export interface InfoCardData {
  title?: string;
  content: string;
  icon?: string;
  color?: string;
}

export interface QueryResponse {
  response: string;
  actions?: { label: string; query: string }[];
  eventCards?: EventCardData[];
  resultCard?: ResultCardData;
  contactCard?: ContactCardData;
  infoCard?: InfoCardData;
}

const faqs: FAQ[] = faqsData;
const results: Results = resultsData;

/**
 * Normalize text for matching
 */
function normalize(text: string): string {
  return text.toLowerCase().trim();
}

/**
 * Calculate simple similarity score between two strings
 */
function similarity(str1: string, str2: string): number {
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  
  let matches = 0;
  words1.forEach(word => {
    if (words2.some(w => w.includes(word) || word.includes(w))) {
      matches++;
    }
  });
  
  return matches / Math.max(words1.length, words2.length);
}

/**
 * Check if query is asking for results
 */
function isResultQuery(query: string): { isResult: boolean; eventType?: string } {
  const normalized = normalize(query);
  const resultKeywords = ['result', 'winner', 'won', 'who won'];
  
  const hasResultKeyword = resultKeywords.some(keyword => normalized.includes(keyword));
  
  if (!hasResultKeyword) {
    return { isResult: false };
  }
  
  // Check for event type - ORDER MATTERS! Check most specific first
  const eventMap: { [key: string]: string } = {
    'mystric map': 'mystricmap',
    'mystric': 'mystricmap',
    'webforge': 'webforge',
    'web forge': 'webforge',
    'decode': 'decode',
    'recode': 'decode',
    'vibecon': 'vibecon',
    'paper': 'paper',
    'presentation': 'paper',
    'snap ai': 'snapai',
    'snap': 'snapai',
    'memewar': 'memewar',
    'meme': 'memewar',
  };
  
  // Check multi-word matches first (more specific)
  for (const [keyword, eventType] of Object.entries(eventMap)) {
    if (keyword.includes(' ') && normalized.includes(keyword)) {
      return { isResult: true, eventType };
    }
  }
  
  // Then check single-word matches
  for (const [keyword, eventType] of Object.entries(eventMap)) {
    if (!keyword.includes(' ') && normalized.includes(keyword)) {
      return { isResult: true, eventType };
    }
  }
  
  return { isResult: true };
}

/**
 * Format result response as card data
 */
function formatResultCard(eventType: string): ResultCardData | null {
  const result = results[eventType];
  
  if (!result) {
    return null;
  }
  
  const eventConfig: { [key: string]: { icon: string; title: string; color: string } } = {
    webforge: { icon: "🌐", title: "Web Forge", color: "from-blue-500 to-blue-600" },
    decode: { icon: "💻", title: "Decode & Recode", color: "from-purple-500 to-purple-600" },
    vibecon: { icon: "📡", title: "Internet Using Vibecon", color: "from-cyan-500 to-cyan-600" },
    paper: { icon: "📝", title: "Paper Presentation", color: "from-green-500 to-green-600" },
    mystricmap: { icon: "🗺️", title: "Mystric Map Challenge", color: "from-orange-500 to-orange-600" },
    snapai: { icon: "🤖", title: "Snap with AI", color: "from-pink-500 to-pink-600" },
    memewar: { icon: "😂", title: "Memewar", color: "from-yellow-500 to-yellow-600" },
  };
  
  const config = eventConfig[eventType] || { icon: "🎯", title: eventType, color: "from-indigo-500 to-indigo-600" };
  
  const isPending = result.winner === 'Pending' || result.status.toLowerCase().includes('progress') || result.status.toLowerCase().includes('ongoing');
  
  return {
    icon: config.icon,
    title: config.title,
    winner: result.winner,
    runnerUp: result.runnerUp,
    status: result.status,
    color: config.color,
    isPending,
  };
}

/**
 * Check if query is asking for event list
 */
function isEventListQuery(query: string): boolean {
  const normalized = normalize(query);
  const eventKeywords = ['events', 'schedule', 'happening', 'event list', 'all events'];
  return eventKeywords.some(keyword => normalized.includes(keyword));
}

/**
 * Check if query is asking for venue/location information
 */
function isVenueQuery(query: string): boolean {
  const normalized = normalize(query);
  const venueKeywords = ['venue', 'location', 'where', 'place', 'hall', 'lab', 'room'];
  return venueKeywords.some(keyword => normalized.includes(keyword));
}

/**
 * Check if query is asking for technical events specifically
 */
function isTechnicalEventsQuery(query: string): boolean {
  const normalized = normalize(query);
  const techKeywords = ['technical events', 'tech events', 'coding', 'programming'];
  return techKeywords.some(keyword => normalized.includes(keyword));
}

/**
 * Check if query is asking for non-technical events specifically
 */
function isNonTechnicalEventsQuery(query: string): boolean {
  const normalized = normalize(query);
  const nonTechKeywords = ['non-technical', 'fun events', 'creative', 'non technical'];
  return nonTechKeywords.some(keyword => normalized.includes(keyword));
}

/**
 * Check if query is asking for contact info
 */
function isContactQuery(query: string): boolean {
  const normalized = normalize(query);
  const contactKeywords = ['contact', 'help', 'support', 'phone', 'email', 'coordinator', 'organizer'];
  return contactKeywords.some(keyword => normalized.includes(keyword));
}

/**
 * Check if query is asking for about/info
 */
function isAboutQuery(query: string): boolean {
  const normalized = normalize(query);
  const aboutKeywords = ['about', 'asta25', 'asta 25', 'symposium info', 'event info', 'what is asta'];
  return aboutKeywords.some(keyword => normalized.includes(keyword));
}

/**
 * Get contact card data
 */
function getContactCard(): ContactCardData {
  return {
    email: 'astasct2k25@gmail.com',
    website: 'www.selvamtech.edu.in',
    mobile: '94866 48899',
    facultyCoordinators: [
      { name: 'Mrs. P. Abinaya', phone: '7397548124' },
      { name: 'Mrs. M. Sumathi', phone: '9789673675' },
      { name: 'Mrs. S. Saranya', phone: '9952683505' },
    ],
    studentCoordinators: [
      { name: 'S. Rasu', phone: '9345128264' },
      { name: 'V. Suweetha', phone: '7708767410' },
      { name: 'B. Dharunkumar', phone: '8526506445' },
    ],
  };
}

/**
 * Check if query is asking for general results
 */
function isGeneralResultQuery(query: string): boolean {
  const normalized = normalize(query);
  const resultKeywords = ['result', 'winner', 'won'];
  const hasResultKeyword = resultKeywords.some(keyword => normalized.includes(keyword));
  
  // If has result keyword but no specific event, it's general
  if (!hasResultKeyword) return false;
  
  const eventKeywords = ['coding', 'quiz', 'gaming', 'design', 'paper', 'robotics', 'pitch'];
  const hasEventKeyword = eventKeywords.some(keyword => normalized.includes(keyword));
  
  return !hasEventKeyword;
}

/**
 * Find best matching FAQ
 */
function findBestMatch(userQuery: string): string | null {
  const normalized = normalize(userQuery);
  let bestMatch: FAQ | null = null;
  let bestScore = 0;
  
  for (const faq of faqs) {
    for (const question of faq.question) {
      const score = similarity(normalized, normalize(question));
      
      // Exact substring match gets higher priority
      if (normalize(question).includes(normalized) || normalized.includes(normalize(question))) {
        if (score > bestScore || (score === bestScore && question.length < (bestMatch?.question[0]?.length || Infinity))) {
          bestScore = Math.max(score, 0.7);
          bestMatch = faq;
        }
      } else if (score > bestScore && score > 0.3) {
        bestScore = score;
        bestMatch = faq;
      }
    }
  }
  
  // Only return if confidence is reasonable
  if (bestScore > 0.3 && bestMatch) {
    return bestMatch.answer;
  }
  
  return null;
}

/**
 * Main intent engine - processes user query and returns response with optional actions
 */
export function processQuery(userQuery: string): QueryResponse {
  if (!userQuery || userQuery.trim().length === 0) {
    return {
      response: "Please ask me something about the symposium! I can help with schedules, venues, results, and more.😊"
    };
  }
  
  // Check if it's asking for contact info - provide contact card
  if (isContactQuery(userQuery)) {
    return {
      response: '',
      contactCard: getContactCard(),
    };
  }
  
  // Check if it's asking for about/event info
  if (isAboutQuery(userQuery)) {
    return {
      response: '',
      infoCard: {
        title: 'About ASTA\'25',
        content: '✨ **Event Highlights:**\n\n• 📅 **Date:** October 24, 2025\n• 🏆 **Events:** 7 Exciting Competitions (Technical & Non-Technical)\n• 💰 **Registration:** ₹300 only\n• 🎁 **Prizes:** Attractive Cash Rewards\n\n💡 **I can help you with:**\n\n• 📋 Event schedules & venues\n• 🎯 Registration details\n• 🛠️ Workshop information\n• 📞 Contact organizers\n• 🏅 Results & winners\n\nUse the quick buttons below to explore! 👇',
        icon: '🎉',
        color: 'from-purple-500 to-indigo-600',
      }
    };
  }
  
  // Check if it's a specific result query FIRST (before event list or general results)
  const resultCheck = isResultQuery(userQuery);
  if (resultCheck.isResult && resultCheck.eventType) {
    const resultCard = formatResultCard(resultCheck.eventType);
    if (resultCard) {
      return {
        response: "",
        resultCard
      };
    }
  }
  
  // Check if it's asking for general results - provide clickable buttons
  if (isGeneralResultQuery(userQuery)) {
    return {
      response: "Click on any event to see results:",
      actions: [
        { label: "🌐 Web Forge Results", query: "webforge results" },
        { label: "💻 Decode Results", query: "decode results" },
        { label: "📡 Vibecon Results", query: "vibecon results" },
        { label: "📝 Paper Results", query: "paper results" },
        { label: "🗺️ Map Challenge Results", query: "mystric map results" },
        { label: "🤖 Snap AI Results", query: "snap ai results" },
        { label: "😂 Memewar Results", query: "memewar results" },
      ]
    };
  }
  
  // Check if it's asking for event list - provide visual event cards
  if (isEventListQuery(userQuery)) {
    return {
      response: "We have 7 exciting events at ASTA'25:",
      eventCards: [
        { icon: "🌐", title: "Web Forge", venue: "Website Building Competition", time: "Technical Event", color: "from-blue-500 to-blue-600", query: "web forge" },
        { icon: "💻", title: "Decode & Recode", venue: "Python to C Translation", time: "Technical Event", color: "from-purple-500 to-purple-600", query: "decode recode" },
        { icon: "📡", title: "Internet Using Vibecon", venue: "Internet Technologies", time: "Technical Event", color: "from-cyan-500 to-cyan-600", query: "vibecon" },
        { icon: "📝", title: "Paper Presentation", venue: "Submit by Oct 14, 2025", time: "Technical Event", color: "from-green-500 to-green-600", query: "paper presentation" },
        { icon: "🗺️", title: "Mystric Map Challenge", venue: "Map-based Puzzles", time: "Non-Technical", color: "from-orange-500 to-orange-600", query: "mystric map" },
        { icon: "🤖", title: "Snap with AI", venue: "AI Image Replication", time: "Non-Technical", color: "from-pink-500 to-pink-600", query: "snap with ai" },
        { icon: "😂", title: "Memewar", venue: "Meme Competition", time: "Non-Technical", color: "from-yellow-500 to-yellow-600", query: "memewar" },
      ]
    };
  }
  
  // Try to find matching FAQ - return as InfoCard
  const faqResponse = findBestMatch(userQuery);
  if (faqResponse) {
    // Determine icon and color based on query content
    let icon = '💡';
    let color = 'from-blue-500 to-blue-600';
    let title = 'Information';
    
    const normalized = normalize(userQuery);
    if (normalized.includes('registration') || normalized.includes('fee')) {
      icon = '💰';
      color = 'from-green-500 to-green-600';
      title = 'Registration Details';
    } else if (normalized.includes('workshop') || normalized.includes('fullstack')) {
      icon = '🎓';
      color = 'from-purple-500 to-purple-600';
      title = 'Workshop Information';
    } else if (normalized.includes('prize') || normalized.includes('award')) {
      icon = '🏆';
      color = 'from-yellow-500 to-yellow-600';
      title = 'Prizes & Awards';
    } else if (normalized.includes('asta') || normalized.includes('symposium') || normalized.includes('about')) {
      icon = '🎓';
      color = 'from-indigo-500 to-indigo-600';
      title = 'About ASTA\'25';
    } else if (normalized.includes('college') || normalized.includes('selvam') || normalized.includes('address')) {
      icon = '🏫';
      color = 'from-blue-500 to-blue-600';
      title = 'College Information';
    } else if (normalized.includes('schedule') || normalized.includes('timing') || normalized.includes('date')) {
      icon = '📅';
      color = 'from-orange-500 to-orange-600';
      title = 'Event Schedule';
    } else if (normalized.includes('fun') || normalized.includes('activities')) {
      icon = '🎮';
      color = 'from-pink-500 to-pink-600';
      title = 'Fun Activities';
    }
    
    return {
      response: '',
      infoCard: {
        title,
        content: faqResponse,
        icon,
        color,
      }
    };
  }
  
  // Intelligent fallback with suggestions
  const helpSuggestions = [
    { label: "📅 Show Schedule", query: "show schedule" },
    { label: "🏆 Event Results", query: "show results" },
    { label: "💰 Registration Info", query: "registration details" },
    { label: "📞 Contact Us", query: "contact information" }
  ];

  return {
    response: "I didn't quite understand that. Here are some things I can help with:",
    actions: helpSuggestions,
    infoCard: {
      title: 'Popular Questions',
      content: "**Try asking about:**\n\n• **\"show schedule\"** - View all events & timings\n• **\"web forge details\"** - Get specific event info\n• **\"how to register\"** - Registration process\n• **\"contact details\"** - Get help from organizers\n• **\"workshop info\"** - Learn about technical sessions\n• **\"prizes and awards\"** - Competition rewards\n\nJust type your question naturally - I understand conversational language! 😊",
      icon: '💡',
      color: 'from-blue-500 to-indigo-600',
    }
  };
}

/**
 * Get welcome message
 */
export function getWelcomeMessage(): string {
  return "👋 **Hi there! Welcome to ASTA'25!**\n\nI'm your smart assistant for the National Level Technical Symposium at Selvam College of Technology.\n\n**How can I help you today?** 😊";
}

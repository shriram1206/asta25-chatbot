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

// Conversation context for follow-up questions
interface ConversationContext {
  lastQueries: string[];
  lastEventMentioned?: string;
  lastTopicType?: 'event' | 'result' | 'contact' | 'registration' | 'about';
}

let conversationContext: ConversationContext = {
  lastQueries: [],
};

/**
 * Update conversation context
 */
function updateContext(query: string, topicType?: string, eventMentioned?: string) {
  conversationContext.lastQueries.push(query);
  if (conversationContext.lastQueries.length > 3) {
    conversationContext.lastQueries.shift();
  }
  if (topicType) {
    conversationContext.lastTopicType = topicType as any;
  }
  if (eventMentioned) {
    conversationContext.lastEventMentioned = eventMentioned;
  }
}

/**
 * Resolve pronouns and context references
 */
function resolveContextReferences(query: string): string {
  const normalized = normalize(query);
  
  // Handle pronouns referring to last event
  if (conversationContext.lastEventMentioned) {
    const pronouns = ['it', 'this', 'that', 'this event', 'that event'];
    for (const pronoun of pronouns) {
      if (normalized.includes(pronoun)) {
        return query.replace(new RegExp(pronoun, 'gi'), conversationContext.lastEventMentioned);
      }
    }
  }
  
  // Handle follow-up questions
  if (conversationContext.lastTopicType === 'event' && 
      (normalized.includes('more') || normalized.includes('details') || normalized.includes('tell me'))) {
    if (conversationContext.lastEventMentioned) {
      return `${conversationContext.lastEventMentioned} ${query}`;
    }
  }
  
  return query;
}

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
    'mystic map': 'mystricmap',
    'mystric': 'mystricmap',
    'webforge': 'webforge',
    'web forge': 'webforge',
    'decode': 'decode',
    'recode': 'decode',
    'vibecode': 'vibecode',
    'vibecon': 'vibecode',
    'paper cse': 'paper_cse',
    'paper it': 'paper_it',
    'paper': 'paper_cse',
    'presentation': 'paper_cse',
    'snap ai': 'snapai',
    'snap with ai': 'snapai',
    'snap': 'snapai',
    'memewar': 'memewar',
    'meme war': 'memewar',
    'meme': 'memewar',
    'fun event': 'funevent',
    'workshop': 'workshop',
    'fullstack': 'workshop',
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
    vibecode: { icon: "📡", title: "Internet Using Vibecode", color: "from-cyan-500 to-cyan-600" },
    paper_cse: { icon: "📝", title: "Paper Presentation (CSE)", color: "from-green-500 to-green-600" },
    paper_it: { icon: "📝", title: "Paper Presentation (IT)", color: "from-teal-500 to-teal-600" },
    mystricmap: { icon: "🗺", title: "Mystric Map Challenge", color: "from-orange-500 to-orange-600" },
    snapai: { icon: "🤖", title: "Snap with AI", color: "from-pink-500 to-pink-600" },
    memewar: { icon: "😂", title: "Meme War", color: "from-yellow-500 to-yellow-600" },
    funevent: { icon: "🎉", title: "Fun Event", color: "from-red-500 to-red-600" },
    workshop: { icon: "💼", title: "Fullstack Web Development Workshop", color: "from-indigo-500 to-indigo-600" },
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
  const eventKeywords = ['events', 'happening', 'event list', 'all events', 'show events', 'what events'];
  return eventKeywords.some(keyword => normalized.includes(keyword));
}

/**
 * Check if query is asking for schedule/timing
 */
function isScheduleQuery(query: string): boolean {
  const normalized = normalize(query);
  const scheduleKeywords = ['schedule', 'timing', 'time table', 'timetable', 'agenda', 'when'];
  return scheduleKeywords.some(keyword => normalized.includes(keyword));
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
      { name: 'B. Dharunkumar', phone: '8526506448' },
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
  
  // Resolve context references (pronouns, follow-ups)
  const resolvedQuery = resolveContextReferences(userQuery);
  const queryToProcess = resolvedQuery !== userQuery ? resolvedQuery : userQuery;
  
  // Check if it's asking for contact info - provide contact card
  if (isContactQuery(queryToProcess)) {
    updateContext(userQuery, 'contact');
    return {
      response: '',
      contactCard: getContactCard(),
    };
  }
  
  // Check if it's asking for about/event info
  if (isAboutQuery(queryToProcess)) {
    updateContext(userQuery, 'about');
    return {
      response: '',
      infoCard: {
        title: 'About ASTA\'25',
        content: '✨ **Event Highlights:**\n\n• 📅 **Date:** October 24, 2025\n• 🎊 **Inauguration:** 10:00 AM - Mechanical Seminar Hall\n• 👤 **Chief Guest:** Er. T. Sadananthan (Ettik Engineering)\n• 👤 **Guest of Honor:** Er. Deepak Madheswaran (HCL Tech)\n• 🍽 **Lunch:** Sundar Pichai Boys Hostel Mess (1:30 PM)\n• 🏆 **Events:** 10 Exciting Competitions\n• 💰 **Registration:** ₹300 only\n• 🎁 **Prizes:** Attractive Cash Rewards\n\n💡 **I can help you with:**\n\n• 📋 Event schedules & venues\n• 🎯 Registration & dress code\n• 🔧 Workshop information\n• 🍽 Lunch & inauguration details\n• 👤 Guest information\n• 📞 Contact organizers\n• 🏅 Results & winners\n\nUse the quick buttons below to explore! 👇',
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
        { label: "📝 Paper Presentation Results", query: "paper results" },
        { label: "🌐 Web Forge Results", query: "webforge results" },
        { label: "🤝 Decode Results", query: "decode results" },
        { label: "🫨 Vibecode Results", query: "vibecode results" },
        { label: "🗺 Map Challenge Results", query: "mystric map results" },
        { label: "🤖 Snap AI Results", query: "snap ai results" },
        { label: "😂 Meme War Results", query: "meme war results" },
        { label: "🎉 Fun Event Results", query: "fun event results" },
      ]
    };
  }
  
  // Check if it's asking for schedule/timeline BEFORE checking for event list
  // Schedule queries should show the complete timeline from FAQ, not just event cards
  if (isScheduleQuery(userQuery)) {
    const faqResponse = findBestMatch(userQuery);
    if (faqResponse) {
      return {
        response: '',
        infoCard: {
          title: 'Event Schedule',
          content: faqResponse,
          icon: '📅',
          color: 'from-orange-500 to-orange-600',
        }
      };
    }
  }
  
  // Check if it's asking for event list - provide visual event cards
  if (isEventListQuery(userQuery)) {
    return {
      response: "We have 10 exciting events at ASTA'25:",
      eventCards: [
        { icon: "📝", title: "Paper Presentation", venue: "VB-SF-09 & VB-SF-12", time: "11:15 AM", color: "from-green-500 to-green-600", query: "paper presentation" },
        { icon: "🌐", title: "Web Forge", venue: "VB-SF-01 (CSE Lab)", time: "11:15 AM", color: "from-blue-500 to-blue-600", query: "web forge" },
        { icon: "💻", title: "Decode & Recode", venue: "VB-SF-01 (IT Lab)", time: "11:30 AM", color: "from-purple-500 to-purple-600", query: "decode recode" },
        { icon: "📡", title: "Internet Using Vibecode", venue: "VB-FF-07 (AI&DS Lab)", time: "11:30 AM", color: "from-cyan-500 to-cyan-600", query: "vibecode" },
        { icon: "👦", title: "Mystric Map Challenge", venue: "Mechanical Seminar Hall", time: "11:15 AM", color: "from-orange-500 to-orange-600", query: "mystric map" },
        { icon: "🤖", title: "Snap with AI", venue: "VB-SF-15 (IV IT)", time: "12:30 PM", color: "from-pink-500 to-pink-600", query: "snap with ai" },
        { icon: "👊", title: "Meme War", venue: "VB-TF-12 (III AI&DS)", time: "12:00 PM", color: "from-yellow-500 to-yellow-600", query: "meme war" },
        { icon: "🎉", title: "Fun Event", venue: "VB-SF-16 (II IT)", time: "11:15 AM", color: "from-red-500 to-red-600", query: "fun event" },
        { icon: "💼", title: "Fullstack Workshop", venue: "EEE Seminar Hall", time: "11:15 AM", color: "from-indigo-500 to-indigo-600", query: "workshop" },
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

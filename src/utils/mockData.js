/**
 * Realistic Mock Data for Professional Journalist Portfolio
 * Used as fallback when API is not available or for development
 */

import { USER_NAME } from "../config/constants";

export const mockProfile = {
  name: `${USER_NAME}`,
  title: 'Award-Winning Investigative Journalist',
  headline: 'Investigative Reporter | Documentary Filmmaker | Media Consultant',
  short_bio: 'Award-winning investigative journalist with over 15 years of experience uncovering truth and telling stories that matter. Specialized in political corruption, human rights, and environmental issues.',
  bio: `${USER_NAME} is an award-winning investigative journalist with over 15 years of experience in uncovering truth and telling stories that matter. Her work has been featured in major publications including The New York Times, The Guardian, and BBC News.

She specializes in political corruption, human rights violations, and environmental issues. Her investigative series on corporate environmental violations won the Pulitzer Prize for Investigative Reporting in 2020.

Sarah has reported from over 40 countries, covering conflicts, political upheavals, and social justice movements. Her documentary work has been screened at international film festivals and has influenced policy changes in multiple countries.

She holds a Master's degree in Journalism from Columbia University and is a member of the International Consortium of Investigative Journalists (ICIJ).`,
  profile_image_url: 'https://i.postimg.cc/qqYgkRYp/profile.png',
  email: 'sugyan.sagar@journalist.com',
  phone: '+1 (555) 123-4567',
  location: 'New York, USA',
  website: 'https://sarahmitchell.com',
  experience: '15+ years of investigative journalism experience',
  education: 'M.A. Journalism, Columbia University | B.A. Political Science, Harvard University',
  languages: 'English (Native), Spanish (Fluent), French (Conversational), Arabic (Basic)',
  specializations: 'Investigative Reporting, Political Corruption, Human Rights, Environmental Journalism, Documentary Filmmaking',
  awards: 'Pulitzer Prize for Investigative Reporting (2020), Peabody Award (2019), Edward R. Murrow Award (2018), Overseas Press Club Award (2017)',
  resume_url: '#',
};

export const mockSocialLinks = [
  { id: 1, platform: 'Twitter', url: 'https://twitter.com/sarahmitchell', icon: '🐦', is_active: true },
  { id: 2, platform: 'LinkedIn', url: 'https://linkedin.com/in/sarahmitchell', icon: '💼', is_active: true },
  { id: 3, platform: 'Instagram', url: 'https://instagram.com/sarahmitchell', icon: '📷', is_active: true },
  { id: 4, platform: 'YouTube', url: 'https://youtube.com/@sarahmitchell', icon: '📺', is_active: true },
  { id: 5, platform: 'Email', url: 'mailto:sarah.mitchell@journalist.com', icon: '✉️', is_active: true },
];

export const mockPosts = [
  {
    id: '1',
    slug: 'uncovering-corporate-environmental-violations',
    title: 'Uncovering Corporate Environmental Violations: A Three-Year Investigation',
    subtitle: 'How major corporations are evading environmental regulations',
    type: 'article',
    cover_image_url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop',
    media_type: 'image',
    excerpt: 'An in-depth investigation revealing how major corporations have been systematically violating environmental regulations while avoiding accountability. This three-year investigation involved analyzing thousands of documents and interviewing over 200 sources.',
    content: `<h2>The Investigation Begins</h2>
    <p>Three years ago, I received a tip from an anonymous source about potential environmental violations at a major manufacturing plant. What started as a single tip led to one of the most comprehensive investigations of my career.</p>
    <h2>Uncovering the Truth</h2>
    <p>Through months of document analysis, Freedom of Information Act requests, and interviews with current and former employees, I uncovered a pattern of systematic violations that spanned multiple facilities across the country.</p>
    <h2>The Impact</h2>
    <p>This investigation led to federal investigations, policy changes, and increased public awareness about corporate environmental accountability.</p>`,
    tags: 'investigation, environment, corporate accountability, pollution',
    category: 'Investigative',
    status: 'published',
    is_featured: true,
    published_at: '2024-01-15T10:00:00Z',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    author_name: `${USER_NAME}`,
    view_count: 12500,
    read_time_minutes: 12,
    seo_title: 'Corporate Environmental Violations Investigation',
    seo_description: 'Award-winning investigation into corporate environmental violations',
  },
  {
    id: '2',
    slug: 'human-rights-crisis-border-communities',
    title: 'Human Rights Crisis in Border Communities',
    subtitle: 'Documenting the untold stories of displacement and resilience',
    type: 'article',
    cover_image_url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop',
    media_type: 'image',
    excerpt: 'A comprehensive report on the human rights situation in border communities, featuring firsthand accounts from affected families and analysis of policy implications.',
    content: `<h2>On the Ground</h2>
    <p>For six months, I traveled along border communities, documenting the stories of families affected by displacement and policy changes.</p>
    <h2>Personal Stories</h2>
    <p>The human impact of these policies cannot be overstated. Through interviews and documentation, I captured the resilience and strength of these communities.</p>`,
    tags: 'human rights, immigration, border, policy',
    category: 'Human Rights',
    status: 'published',
    is_featured: true,
    published_at: '2024-01-10T14:30:00Z',
    read_time_minutes: 8,
    view_count: 8900,
  },
  {
    id: '3',
    slug: 'political-corruption-expose',
    title: 'Political Corruption Exposé: Money, Power, and Influence',
    subtitle: 'Following the money trail in local politics',
    type: 'article',
    cover_image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
    media_type: 'image',
    excerpt: 'An investigative piece tracing campaign contributions and their influence on policy decisions, revealing connections between donors and political outcomes.',
    content: `<h2>The Money Trail</h2>
    <p>Through careful analysis of campaign finance records and policy decisions, I traced the connections between major donors and political outcomes.</p>`,
    tags: 'politics, corruption, investigation, campaign finance',
    category: 'Politics',
    status: 'published',
    is_featured: true,
    published_at: '2024-01-05T09:15:00Z',
    read_time_minutes: 15,
    view_count: 15200,
  },
  {
    id: '4',
    slug: 'climate-change-coastal-communities',
    title: 'Climate Change and Coastal Communities: Adapting to a New Reality',
    subtitle: 'How communities are preparing for rising sea levels',
    type: 'article',
    cover_image_url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop',
    media_type: 'image',
    excerpt: 'A feature story exploring how coastal communities are adapting to climate change, featuring innovative solutions and community resilience.',
    content: `<h2>Adaptation Strategies</h2>
    <p>Coastal communities are developing innovative strategies to adapt to rising sea levels and changing weather patterns.</p>`,
    tags: 'climate change, environment, adaptation, communities',
    category: 'Environment',
    status: 'published',
    is_featured: true,
    published_at: '2023-12-28T11:00:00Z',
    read_time_minutes: 10,
    view_count: 7600,
  },
  {
    id: '5',
    slug: 'refugee-crisis-documentary',
    title: 'The Refugee Crisis: A Documentary Journey',
    subtitle: 'Stories of hope and resilience from refugee camps',
    type: 'video',
    cover_image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=600&fit=crop',
    media_type: 'video',
    media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    excerpt: 'A documentary film exploring the lives of refugees, their journeys, and their hopes for the future. This project took two years to complete.',
    content: `<h2>Behind the Scenes</h2>
    <p>This documentary was two years in the making, following refugee families from their journey to resettlement.</p>`,
    tags: 'refugees, documentary, human rights, migration',
    category: 'Documentary',
    status: 'published',
    is_featured: true,
    published_at: '2023-12-20T16:00:00Z',
    read_time_minutes: 45,
    view_count: 23400,
  },
  {
    id: '6',
    slug: 'tech-giants-data-privacy',
    title: 'Tech Giants and Data Privacy: What They Know About You',
    subtitle: 'Investigating data collection practices of major tech companies',
    type: 'article',
    cover_image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop',
    media_type: 'image',
    excerpt: 'An investigation into how major tech companies collect, use, and monetize user data, and what it means for privacy rights.',
    content: `<h2>Data Collection Practices</h2>
    <p>Through interviews with former employees and analysis of privacy policies, I uncovered the extent of data collection practices.</p>`,
    tags: 'technology, privacy, data, investigation',
    category: 'Technology',
    status: 'published',
    is_featured: false,
    published_at: '2023-12-15T10:30:00Z',
    read_time_minutes: 11,
    view_count: 9800,
  },
];

export const mockCategories = [
  { id: 'cat_001', name: 'Investigative', slug: 'investigative', description: 'In-depth investigative reporting', color: '#2563eb', icon: '🔍', is_active: true, post_count: 12 },
  { id: 'cat_002', name: 'Human Rights', slug: 'human-rights', description: 'Human rights and social justice', color: '#10b981', icon: '✊', is_active: true, post_count: 8 },
  { id: 'cat_003', name: 'Politics', slug: 'politics', description: 'Political reporting and analysis', color: '#ef4444', icon: '🏛️', is_active: true, post_count: 15 },
  { id: 'cat_004', name: 'Environment', slug: 'environment', description: 'Environmental journalism', color: '#10b981', icon: '🌍', is_active: true, post_count: 10 },
  { id: 'cat_005', name: 'Documentary', slug: 'documentary', description: 'Documentary films and multimedia', color: '#8b5cf6', icon: '🎬', is_active: true, post_count: 6 },
  { id: 'cat_006', name: 'Technology', slug: 'technology', description: 'Tech and digital issues', color: '#6366f1', icon: '💻', is_active: true, post_count: 7 },
];

export const mockStats = {
  totalStories: 58,
  countriesCovered: 42,
  awards: 12,
  yearsExperience: 15,
  publications: ['The New York Times', 'The Guardian', 'BBC News', 'Reuters', 'Associated Press', 'The Washington Post'],
};

export const mockAwards = [
  { year: 2020, award: 'Pulitzer Prize for Investigative Reporting', organization: 'Columbia University' },
  { year: 2019, award: 'Peabody Award', organization: 'University of Georgia' },
  { year: 2018, award: 'Edward R. Murrow Award', organization: 'RTDNA' },
  { year: 2017, award: 'Overseas Press Club Award', organization: 'OPC' },
  { year: 2016, award: 'Goldsmith Prize for Investigative Reporting', organization: 'Harvard Kennedy School' },
];

export const mockPublications = [
  { name: 'The New York Times', logo: '📰', articles: 24 },
  { name: 'The Guardian', logo: '📖', articles: 18 },
  { name: 'BBC News', logo: '📺', articles: 15 },
  { name: 'Reuters', logo: '📡', articles: 12 },
  { name: 'Associated Press', logo: '📰', articles: 10 },
  { name: 'The Washington Post', logo: '📰', articles: 8 },
];








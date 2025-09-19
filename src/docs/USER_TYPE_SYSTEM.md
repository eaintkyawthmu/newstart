# User Type System - Complete Data Flow Documentation

## Overview
This document explains the complete user onboarding and content filtering system that personalizes content based on user types.

## System Architecture

### 1. User Type Classification
Users are classified into two main categories:
- **Immigrant**: Users who moved to the U.S. permanently or plan to stay long-term
- **Non-Immigrant**: Users who are in the U.S. temporarily (students, workers, tourists, etc.)

### 2. Database Schema
The system uses the existing `profiles` table in Supabase:
```sql
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  user_type TEXT NOT NULL CHECK (user_type IN ('immigrant', 'nonImmigrant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- other profile fields...
)
```

### 3. Sanity CMS Schema
Each content type in Sanity includes a `targetAudience` field:
```javascript
{
  name: 'targetAudience',
  title: 'Target Audience',
  type: 'string',
  options: {
    list: [
      { title: 'All Users', value: 'all' },
      { title: 'Immigrants', value: 'immigrant' },
      { title: 'Non-Immigrants', value: 'nonImmigrant' }
    ]
  },
  initialValue: 'all'
}
```

## Complete Data Flow

### Phase 1: User Registration & Onboarding

#### Step 1: Account Creation
```
User Registration → Auth.tsx
├── Creates auth.users record
├── Creates profiles record with default user_type: 'immigrant'
└── Redirects to profile setup
```

#### Step 2: Profile Setup & User Type Selection
```
ProfileSetupPage.tsx → InitialOnboardingChecklist.tsx
├── Step 1: User Type Selection
│   ├── "I moved to the U.S. and will live here from now on" → 'immigrant'
│   └── "No, I'm here for a limited time" → 'nonImmigrant'
├── Step 2-4: Additional profile information
└── Saves user_type to profiles.user_type column
```

#### Step 3: User Type Determination Logic
```typescript
// In InitialOnboardingChecklist.tsx
const determineUserType = (responses: {
  permanentResident: boolean;
  planToStayLongTerm: boolean;
}): UserType => {
  if (responses.permanentResident || responses.planToStayLongTerm) {
    return 'immigrant';
  }
  return 'nonImmigrant';
};
```

### Phase 2: Content Fetching & Filtering

#### Step 1: User Type Retrieval
```
useUserType Hook (src/hooks/useUserType.ts)
├── Fetches user_type from profiles table
├── Provides loading states
├── Handles errors gracefully
└── Returns: { userType, userProfile, loading, error }
```

#### Step 2: Content Query with Filtering
```
JourneyHub.tsx → sanityClient.fetchJourneyPaths()
├── Passes userType to Sanity query
├── GROQ query filters content:
│   └── (targetAudience == "all" || targetAudience == $userType)
└── Returns only relevant content
```

#### Step 3: GROQ Query Structure
```groq
*[
  _type == "journeyPath" && 
  (targetAudience == "all" || targetAudience == $userType)
] {
  _id,
  title,
  description,
  "slug": slug.current,
  duration,
  level,
  rating,
  enrolled,
  isPremium,
  targetAudience,
  "coverImage": {
    "url": coverImage.asset->url,
    "alt": coverImage.alt
  },
  "modules": *[
    _type == "module" && 
    references(^._id) &&
    (targetAudience == "all" || targetAudience == $userType)
  ] | order(order asc) {
    _id,
    title,
    description,
    duration,
    order,
    targetAudience,
    "lessons": *[
      _type == "lesson" && 
      references(^._id) &&
      (targetAudience == "all" || targetAudience == $userType)
    ] | order(order asc) {
      _id,
      title,
      "slug": slug.current,
      description,
      duration,
      type,
      order,
      targetAudience
    }
  }
} | order(order asc)
```

### Phase 3: Content Display & User Experience

#### Step 1: Filtered Content Display
```
FilteredContentDisplay Component
├── Receives filtered content from Sanity
├── Shows loading states during user type fetch
├── Displays debug information (development only)
├── Handles empty states gracefully
└── Renders personalized content grid
```

#### Step 2: Content Visibility Logic
```typescript
const shouldShowContent = (
  targetAudience: 'all' | 'immigrant' | 'nonImmigrant' | undefined,
  userType: UserType | null
): boolean => {
  // Always show content marked for 'all'
  if (!targetAudience || targetAudience === 'all') return true;
  
  // If no user type set, only show 'all' content
  if (!userType) return false;
  
  // Show content that matches user's type
  return targetAudience === userType;
};
```

## Error Handling & Edge Cases

### 1. Missing User Type
- **Fallback**: Shows only content marked as 'all'
- **User Experience**: Prompts to complete profile setup
- **Data Integrity**: Prevents crashes with null checks

### 2. Network Errors
- **Retry Logic**: Automatic retry with exponential backoff
- **Fallback Content**: Shows cached content when available
- **User Feedback**: Clear error messages and retry options

### 3. Empty Content States
- **No Relevant Content**: Shows helpful message with profile type info
- **Loading States**: Skeleton loaders during data fetch
- **Debug Information**: Development mode shows filtering statistics

## Performance Optimizations

### 1. Query Optimization
- **Single Query**: Fetches filtered content in one request
- **Nested Filtering**: Applies filtering at all levels (paths → modules → lessons)
- **Proper Indexing**: Database indexes on user_type for fast lookups

### 2. Caching Strategy
- **React Query**: Caches filtered content with user type as cache key
- **Stale While Revalidate**: Shows cached content while fetching updates
- **Invalidation**: Cache invalidates when user type changes

### 3. Loading States
- **Progressive Loading**: Shows content as it becomes available
- **Skeleton Screens**: Maintains layout during loading
- **Optimistic Updates**: Immediate UI feedback for user actions

## Security Considerations

### 1. Row Level Security (RLS)
- **Profiles Table**: Users can only read/update their own profile
- **Content Access**: No sensitive data exposed through filtering
- **Authentication**: All queries require valid user session

### 2. Data Validation
- **Type Constraints**: Database enforces valid user types
- **Input Sanitization**: All user inputs are validated
- **Error Boundaries**: Graceful handling of unexpected errors

## Testing Strategy

### 1. User Type Scenarios
- **New User**: Default type assignment and onboarding flow
- **Immigrant User**: Content filtering for long-term residents
- **Non-Immigrant User**: Content filtering for temporary residents
- **Type Changes**: Profile updates and content re-filtering

### 2. Content Scenarios
- **All Content**: Visible to all user types
- **Immigrant Content**: Only visible to immigrant users
- **Non-Immigrant Content**: Only visible to non-immigrant users
- **Mixed Content**: Proper filtering at module and lesson levels

## Monitoring & Analytics

### 1. Content Effectiveness
- **Filter Statistics**: Track how much content is filtered out
- **User Engagement**: Monitor engagement with filtered content
- **Content Gaps**: Identify missing content for specific user types

### 2. User Journey Tracking
- **Onboarding Completion**: Track user type selection rates
- **Content Consumption**: Monitor which content types are most popular
- **User Satisfaction**: Track completion rates by user type

## Troubleshooting Guide

### Common Issues
1. **No Content Showing**: Check user type is set and Sanity content has targetAudience field
2. **Wrong Content**: Verify targetAudience values match user type exactly
3. **Loading Forever**: Check network connectivity and Sanity credentials
4. **Type Errors**: Ensure all interfaces match database schema

### Debug Tools
- **Development Mode**: Shows filtering statistics and user type info
- **Console Logs**: Detailed logging of filtering decisions
- **React Query DevTools**: Inspect cache and query states
- **Network Tab**: Monitor Sanity API calls and responses

## Future Enhancements

### 1. Advanced Filtering
- **Multiple Types**: Support for hybrid user types
- **Geographic Filtering**: Content based on location
- **Language Preferences**: Multi-language content filtering
- **Experience Level**: Beginner vs advanced content

### 2. Personalization
- **Learning History**: Content recommendations based on progress
- **Goal-Based Filtering**: Content aligned with user's stated goals
- **Adaptive Content**: Dynamic difficulty based on user performance
- **Social Features**: Community content based on user type

This system provides a robust foundation for personalized content delivery while maintaining excellent performance and user experience.
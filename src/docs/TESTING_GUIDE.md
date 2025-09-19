# User Type System Testing Guide

## Overview
This guide provides comprehensive testing procedures for the user type content filtering system.

## Automated Testing Tools

### 1. Debug Panel (Development Only)
- **Location**: Bottom-left corner of Journey Hub page
- **Access**: Purple bug icon in development mode
- **Features**:
  - Real-time user type display
  - Content filtering statistics
  - Quick user type switching
  - Live validation results

### 2. Validation Test Page
- **URL**: `/user-type-test` (development only)
- **Features**:
  - Comprehensive system testing
  - User type switching with validation
  - Database integration testing
  - Content filtering verification

### 3. Content Validation Hook
- **File**: `src/hooks/useContentValidation.ts`
- **Purpose**: Programmatic testing of the filtering system
- **Usage**: Automatically runs when user type changes

## Manual Testing Procedures

### Test Scenario 1: New User Onboarding
1. **Create a new account** through the registration flow
2. **Complete profile setup** and select "Immigrant" user type
3. **Navigate to Journey Hub** (`/journey`)
4. **Verify** that only immigrant and "all" content is visible
5. **Check debug panel** to confirm filtering statistics

### Test Scenario 2: User Type Switching
1. **Go to Profile Setup** (`/profile-setup`)
2. **Change user type** from "Immigrant" to "Non-Immigrant"
3. **Save changes** and navigate back to Journey Hub
4. **Verify** that content has changed appropriately
5. **Check** that different modules/lessons are now visible

### Test Scenario 3: Content Validation
1. **Access the test page** (`/user-type-test`)
2. **Run comprehensive test** to validate both user types
3. **Review results** for any errors or warnings
4. **Test user type switching** using the provided buttons
5. **Verify** that validation passes for both types

### Test Scenario 4: Sanity Content Verification
1. **Log into Sanity Studio**
2. **Check journey paths** have `targetAudience` field set
3. **Verify modules** have appropriate `targetAudience` values
4. **Ensure lessons** are properly tagged
5. **Test with mixed content** (some "all", some specific types)

## Expected Results

### Immigrant Users Should See:
- ✅ Content marked as `targetAudience: "immigrant"`
- ✅ Content marked as `targetAudience: "all"`
- ❌ Content marked as `targetAudience: "nonImmigrant"`

### Non-Immigrant Users Should See:
- ✅ Content marked as `targetAudience: "nonImmigrant"`
- ✅ Content marked as `targetAudience: "all"`
- ❌ Content marked as `targetAudience: "immigrant"`

### Users Without Type Set Should See:
- ✅ Content marked as `targetAudience: "all"`
- ❌ Content marked as `targetAudience: "immigrant"`
- ❌ Content marked as `targetAudience: "nonImmigrant"`

## Debugging Common Issues

### Issue: No Content Filtering
**Symptoms**: All users see the same content regardless of type
**Causes**:
- All content marked as `targetAudience: "all"`
- Missing `targetAudience` field in Sanity schema
- GROQ query not filtering properly

**Solutions**:
1. Check Sanity Studio for `targetAudience` field
2. Verify content has mixed audience types
3. Review GROQ query in `sanityClient.ts`

### Issue: No Content Visible
**Symptoms**: Users see empty state or no journey paths
**Causes**:
- No content marked for user's type
- Sanity authentication issues
- Network connectivity problems

**Solutions**:
1. Check Sanity Studio has published content
2. Verify environment variables are set
3. Check browser network tab for API errors

### Issue: User Type Not Detected
**Symptoms**: Debug panel shows "Not set" for user type
**Causes**:
- Profile not completed during onboarding
- Database connection issues
- User type not saved properly

**Solutions**:
1. Complete profile setup flow
2. Check Supabase database for user record
3. Verify `user_type` column has valid values

## Performance Testing

### Load Testing
1. **Test with large content sets** (50+ journey paths)
2. **Monitor query performance** in browser dev tools
3. **Check memory usage** during content filtering
4. **Verify caching** is working with React Query

### Network Testing
1. **Test with slow connections** (throttle in dev tools)
2. **Verify offline behavior** (disconnect network)
3. **Check error handling** for failed requests
4. **Test retry mechanisms** for failed queries

## Validation Checklist

### ✅ Database Integration
- [ ] User type saves correctly to profiles table
- [ ] User type updates reflect immediately in UI
- [ ] Profile completion triggers proper user type detection
- [ ] Database constraints prevent invalid user types

### ✅ Content Filtering
- [ ] GROQ queries filter content by targetAudience
- [ ] Filtering works at journey path level
- [ ] Filtering works at module level
- [ ] Filtering works at lesson level
- [ ] Mixed content (some filtered, some "all") works correctly

### ✅ User Experience
- [ ] Loading states show during user type detection
- [ ] Empty states appear when no relevant content exists
- [ ] Error states handle network/API failures gracefully
- [ ] Content updates immediately when user type changes

### ✅ Edge Cases
- [ ] New users without user type set see appropriate content
- [ ] Users with invalid user types are handled gracefully
- [ ] Network failures don't break the filtering system
- [ ] Sanity API errors are handled with fallbacks

## Monitoring in Production

### Analytics to Track
- User type distribution (immigrant vs non-immigrant)
- Content engagement by user type
- Filtering effectiveness metrics
- User type change frequency

### Error Monitoring
- Failed content fetches by user type
- Sanity API errors and timeouts
- Database update failures
- User type validation errors

### Performance Metrics
- Content fetch times by user type
- Cache hit rates for filtered content
- Memory usage during filtering
- Bundle size impact of filtering logic

## Troubleshooting Commands

### Check User Type in Browser Console
```javascript
// Get current user type
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('profiles')
  .select('user_type')
  .eq('id', user.id)
  .single();
console.log('User type:', profile.user_type);
```

### Test Content Filtering
```javascript
// Test content filtering manually
import { fetchJourneyPaths } from './src/lib/sanityClient';

const allContent = await fetchJourneyPaths(['new-to-america'], undefined);
const immigrantContent = await fetchJourneyPaths(['new-to-america'], 'immigrant');
const nonImmigrantContent = await fetchJourneyPaths(['new-to-america'], 'nonImmigrant');

console.log('All:', allContent.length);
console.log('Immigrant:', immigrantContent.length);
console.log('Non-Immigrant:', nonImmigrantContent.length);
```

### Validate Sanity Content
```javascript
// Check Sanity content structure
const { sanityClient } = await import('./src/lib/sanityClient');
const paths = await sanityClient.fetch(`
  *[_type == "journeyPath"] {
    title,
    targetAudience,
    "moduleCount": count(modules),
    "modules": modules[]-> {
      title,
      targetAudience,
      "lessonCount": count(lessons)
    }
  }
`);
console.table(paths);
```

This testing framework ensures the user type system works correctly and provides tools for ongoing validation and debugging.
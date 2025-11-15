-- Count distinct participants who have been scored in each section

-- Count distinct participants in Best Paper section
SELECT 
  'Best Paper' as section,
  COUNT(DISTINCT participant_id) as distinct_participants_scored
FROM scores
WHERE section = 'Best Paper';

-- Count distinct participants in Young Researcher section
SELECT 
  'Young Researcher' as section,
  COUNT(DISTINCT participant_id) as distinct_participants_scored
FROM scores
WHERE section = 'Young Researcher';

-- Count distinct participants across all sections
SELECT 
  COUNT(DISTINCT participant_id) as total_distinct_participants_scored
FROM scores;

-- Detailed breakdown: List all distinct participants with their score counts
SELECT 
  participant_id,
  COUNT(*) as total_scores_received,
  COUNT(DISTINCT judge) as unique_judges,
  STRING_AGG(DISTINCT section, ', ') as sections_participated
FROM scores
GROUP BY participant_id
ORDER BY participant_id;

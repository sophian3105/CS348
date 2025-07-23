WITH all_incidents AS (
  -- combine police and user reports from last 12 months
  SELECT 
    pr.assault_type, 
    pl.latitude as lat, 
    pl.longitude as lng, 
    pl.neighborhood, 
    pl.premise_type, 
    'police' as source
  FROM policeReports pr
  JOIN policeLocation pl ON pr.r_id = pl.r_id
  WHERE pr.occurence_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
  
  UNION ALL
  
  SELECT 
    ur.assault_type, 
    ul.latitude as lat, 
    ul.longitude as lng, 
    ul.neighborhood, 
    ul.premise_type, 
    'user' as source
  FROM userReports ur
  JOIN userLocation ul ON ur.r_id = ul.r_id
  WHERE ur.occurence_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
),

nearby_incidents AS (
  -- calc distance from point to each incident using formula
  SELECT 
    *,
    (6371 * acos(
      cos(radians(?)) * cos(radians(lat)) * 
      cos(radians(lng) - radians(?)) + 
      sin(radians(?)) * sin(radians(lat))
    )) AS distance_km
  FROM all_incidents
),

filtered_incidents AS (
  -- only consider incidents 0.5km of the point on the route
  SELECT *
  FROM nearby_incidents
  WHERE distance_km <= 0.5
),

risk_metrics AS (
  SELECT 
    COUNT(*) as incident_count,
    AVG(distance_km) as avg_distance_km,
    GROUP_CONCAT(DISTINCT assault_type) as assault_types,
    GROUP_CONCAT(DISTINCT neighborhood) as neighborhoods,
    GROUP_CONCAT(DISTINCT premise_type) as premise_types,
    SUM(CASE WHEN source = 'police' THEN 1 ELSE 0 END) as police_reports,
    SUM(CASE WHEN source = 'user' THEN 1 ELSE 0 END) as user_reports
  FROM filtered_incidents
),

distance_multiplier AS (
  -- multiplier based on distance
  SELECT 
    *,
    CASE 
      WHEN avg_distance_km < 0.3 THEN 1.3 
      WHEN avg_distance_km < 0.5 THEN 1.1 
      ELSE 1.0                        
    END as distance_factor
  FROM risk_metrics
),

final_calculation AS (
  SELECT 
    *,
    LEAST(10, incident_count * 2 * distance_factor) as calculated_risk_score
  FROM distance_multiplier
)

-- final output + determine if risk is high, medium or low based on calculation
SELECT 
  incident_count as total_incidents,
  avg_distance_km as avg_distance,
  assault_types,
  neighborhoods,
  premise_types,
  police_reports,
  user_reports,
  calculated_risk_score as risk_score,
  CASE 
    WHEN calculated_risk_score >= 5 THEN 'HIGH'
    WHEN calculated_risk_score >= 3 THEN 'MEDIUM'
    ELSE 'LOW'
  END as risk_level
FROM final_calculation;

SELECT neighborhood AS worstNbhd
FROM (
    SELECT neighborhood, COUNT(*) AS total_reports
    FROM policeLocation
    GROUP BY neighborhood
    UNION ALL
    SELECT neighborhood, COUNT(*) AS total_reports
    FROM userLocation
    GROUP BY neighborhood
) AS combinedNeighborhoods
GROUP BY neighborhood
ORDER BY SUM(total_reports) DESC
LIMIT 3;

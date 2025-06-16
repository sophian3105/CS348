<?php include '../db.php'; ?>
<!DOCTYPE html>
<html>
<head>
    <title>Query Runner</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 2rem; }
        select, button { margin-bottom: 1rem; padding: 0.5rem; font-size: 1rem; }
        table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
        th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
        th { background-color: #f4f4f4; }
    </style>
</head>
<body>

<h1>Query Runner</h1>

<form method="post">
    <label for="query">Select a Query:</label>
    <select name="query" id="query">
        <option value="r6a">R6a – User Reports Only</option>
        <option value="r6b">R6b – Police Reports Only</option>
        <option value="r7">R7 – All Reports by Time</option>
        <option value="r8">R8 – Keyword: "brampton"</option>
        <option value="r9">R9 – All Reports by Assault Type</option>
        <option value="r10">R10 – Worst Neighborhoods</option>
    </select>
    <button type="submit">Run</button>
</form>

<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $queryType = $_POST["query"];

    switch ($queryType) {
        case "r6a":
            $sql = "
            SELECT
            ur.r_id AS report_id,
            ur.occurence_date AS occurred_at,
            ul.neighborhood AS neighborhood,
            ul.location_type AS location_name,
            'user' AS source
          FROM userReports ur
          JOIN userLocation ul ON ur.r_id = ul.r_id
          ORDER BY ur.occurence_date DESC;";
            break;

        case "r6b":
            $sql = "
            SELECT
            pr.r_id AS report_id,
            pr.occurence_date AS occurred_at,
            pl.neighborhood AS neighborhood,
            pl.location_type AS location_name,
            'police' AS source
          FROM policeReports pr
          JOIN policeLocation pl ON pr.r_id = pl.r_id
          ORDER BY pr.occurence_date DESC;";
            break;

        case "r7":
            $sql = "
                SELECT ur.r_id AS report_id, ur.occurence_date AS occurred_at, ul.neighborhood AS location_name, 'user' AS source
                FROM userReports ur
                JOIN userLocation ul ON ur.r_id = ul.r_id
                UNION ALL
                SELECT pr.r_id AS report_id, pr.occurence_date AS occurred_at, pl.neighborhood AS location_name, 'police' AS source
                FROM policeReports pr
                JOIN policeLocation pl ON pr.r_id = pl.r_id
                ORDER BY occurred_at DESC";
            break;

        case "r8":
            $sql = "
                SELECT 
                    pr.r_id AS report_id, pr.occurence_date AS occured_at, pl.neighborhood AS location_name, pr.assault_type AS type_id, 'police' AS source
                FROM policeReports pr
                JOIN policeLocation pl ON pr.r_id = pl.r_id
                WHERE LOWER(pr.assault_type) LIKE '%brampton%'
                   OR LOWER(pl.neighborhood) LIKE '%brampton%'

                UNION ALL

                SELECT 
                    ur.r_id AS report_id, ur.occurence_date AS occured_at, ul.neighborhood AS location_name, ur.assault_type AS type_id, 'user' AS source
                FROM userReports ur
                JOIN userLocation ul ON ur.r_id = ul.r_id
                WHERE LOWER(ur.assault_type) LIKE '%brampton%'
                   OR LOWER(ul.neighborhood) LIKE '%brampton%'";
            break;

        case "r9":
            $sql = "
                SELECT ur.r_id AS report_id, ur.occurence_date AS occured_at, ul.neighborhood AS location_name, ur.assault_type AS type_id
                FROM userReports ur
                JOIN userLocation ul ON ur.r_id = ul.r_id
                UNION ALL
                SELECT pr.r_id AS report_id, pr.occurence_date AS occured_at, pl.neighborhood AS location_name, pr.assault_type AS type_id
                FROM policeReports pr
                JOIN policeLocation pl ON pr.r_id = pl.r_id
                ORDER BY type_id ASC";
            break;
            case "r10":
                $sql = "
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
                    LIMIT 3";
                break;            

        default:
            echo "<p>Invalid query selection.</p>";
            exit;
    }

    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        echo "<table><tr>";
        while ($field = $result->fetch_field()) {
            echo "<th>{$field->name}</th>";
        }
        echo "</tr>";

        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            foreach ($row as $val) {
                echo "<td>" . htmlspecialchars($val) . "</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>No results found.</p>";
    }

    $conn->close();
}
?>

</body>
</html>

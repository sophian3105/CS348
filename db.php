<?php
$servername = "127.0.0.1";   // localhost
$username = "root";          // your MySQL username
$password = "";              // your MySQL password (likely empty if you didn't set one)
$dbname = "cs348";           // your actual database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>

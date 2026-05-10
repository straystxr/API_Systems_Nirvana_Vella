<?php

class Bookmark {

    //database connection
    private $conn;


    private $table = "bookmarks";
    private $alias = "b";

    public $id;
    public $userId;
    public $articleId;

    public function __construct($db) {
        $this->conn = $db;
    }

    //adding single Bookmark
    public function save() {

        $query = "INSERT INTO {$this->table}
                    (userId, articleId)
                  VALUES
                    (:userId, :articleId)";

        $stmt = $this->conn->prepare($query);

        //cleaning up data to prevent any security issues such as sql injection
        $this->userId = htmlspecialchars(strip_tags($this->userId));
        $this->articleId = htmlspecialchars(strip_tags($this->articleId));

        $stmt->bindParam(":userId", $this->userId);
        $stmt->bindParam(":articleId", $this->articleId);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    //deleting bookmark from a user's profile
    public function delete() {

        $query = "DELETE FROM {$this->table}
                  WHERE userId = :userId
                  AND articleId = :articleId";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":userId", $this->userId);
        $stmt->bindParam(":articleId", $this->articleId);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    //getting all bookmarks for one user to display them in a single tab
    public function readUserBookmarks() {

        $query = "SELECT *
                  FROM {$this->table} AS {$this->alias}
                  WHERE {$this->alias}.userId = :userId
                  ORDER BY {$this->alias}.id DESC";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":userId", $this->userId);

        $stmt->execute();

        return $stmt;
    }

    //checking if article already bookmarked to prevent bookmarking the same article
    public function exists() {

        $query = "SELECT id
                  FROM {$this->table}
                  WHERE userId = :userId
                  AND articleId = :articleId
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":userId", $this->userId);
        $stmt->bindParam(":articleId", $this->articleId);

        $stmt->execute();

        return $stmt->rowCount() > 0;
    }
}

?>
<?php
   
class Articles{
    //database properties
    private $conn;
    private $table = "articles";
    private $alias = "a";

    //table fields which are the same as the database fields
    public $id;
    public $title;
    public $content;
    public $url;
    public $created_by;
    public $created_at;
    public $verification_status;
    public $category;
    public $updated_at;
  


    //connection
    public function __construct($db){
        $this->conn = $db;
    }

    public function read(){
        $query = "SELECT * FROM {$this->table} AS {$this->alias} ORDER BY {$this->alias}.id DESC";

        $stmt = $this->conn->prepare($query);

        $stmt->execute();

        return $stmt;
    }
    //a function that reads a single article
    public function readSingle(){
        $query = "SELECT *
            FROM {$this->table} AS {$this->alias}
            WHERE {$this->alias}.id = ?
            LIMIT 1;"; //ensures that it only gives us one result from the SQL

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if($row > 0){
            $this->created_by = $row["created_by"];
            $this->title = $row["title"];
            $this->content = $row["content"];
        }

        return $stmt;
    }

    //Read all Article records created by a single user (based on created_by)
    //combination of readSingle function and the read function
    public function readByUserId(){
        $query = "SELECT *
        FROM {$this->table} AS {$this->alias}
        WHERE {$this->alias}.created_by = ?
        LIMIT 1;"; //ensures that it only gives us one result from the SQL

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->created_by);
        $stmt->execute();

        $stmt->execute();

        return $stmt;
    }

     //function to create a new user
        public function create(){
            $query = "INSERT INTO {$this->table}
                        (created_by, title, content)
                        VALUES (:created_by, :title, :content);";

            $stmt = $this->conn->prepare($query);

            //by doing this we are prevent sqlinjection
            $this->created_by = htmlspecialchars(strip_tags($this->created_by));
            $this->title = htmlspecialchars(strip_tags($this->title));
            $this->content = htmlspecialchars(strip_tags($this->content));

            //this creates a security issue which is then fixed with the above
            $stmt->bindParam(":created_by", $this->created_by);
            $stmt->bindParam(":title", $this->title);
            $stmt->bindParam(":content", $this->content);

            //execute returns either a true or a false
            if($stmt->execute()){
                return true;
            }
            
            printf("Error %s. \n", $stmt->error);
            return false;
        }

        public function update(){
            $query = "UPDATE {$this->table}
                        SET title = :title,
                            content = :content
                        WHERE created_by= :created_by";

            $stmt = $this->conn->prepare($query);

            //by doing this we are prevent sqlinjection
            $this->created_by = htmlspecialchars(strip_tags($this->created_by));
            $this->title = htmlspecialchars(strip_tags($this->title));
            $this->content = htmlspecialchars(strip_tags($this->content));

            //this creates a security issue which is then fixed with the above
            $stmt->bindParam(":created_by", $this->created_by);
            $stmt->bindParam(":title", $this->title);
            $stmt->bindParam(":content", $this->content);

            //execute returns either a true or a false
            if($stmt->execute()){
                return true;
            }
            
            printf("Error %s. \n", $stmt->error);
            return false;
        }

        public function updateContent(){
            $query = "UPDATE {$this->table}
                        SET content = :content
                        WHERE id= :id";

            $stmt = $this->conn->prepare($query);

            //by doing this we are prevent sqlinjection
            $this->id = htmlspecialchars(strip_tags($this->id));
            $this->content = htmlspecialchars(strip_tags($this->content));

            //this creates a security issue which is then fixed with the above
            $stmt->bindParam(":id", $this->id);
            $stmt->bindParam(":content", $this->content);

            //execute returns either a true or a false
            if($stmt->execute()){
                return true;
            }
            
            printf("Error %s. \n", $stmt->error);
            return false;
        }

    
        //verifying an article (change status to 'verified')
        //Only verifiers/admins should be able to do this
        public function verify() {
            $query = "UPDATE {$this->table}
                        SET verification_status = 'verified',
                            updated_at = NOW()
                        WHERE id = :id";
    
            $stmt = $this->conn->prepare($query);
            $this->id = htmlspecialchars(strip_tags($this->id));
            $stmt->bindParam(":id", $this->id);
    
            if ($stmt->execute()) {
                return true;
            }
    
            return false;
        }

        //rejecting a post in the case its false news/spam etc
        public function reject() {
            $query = "UPDATE {$this->table}
                        SET verification_status = 'rejected',
                            updated_at = NOW()
                        WHERE id = :id";
    
            $stmt = $this->conn->prepare($query);
            $this->id = htmlspecialchars(strip_tags($this->id));
            $stmt->bindParam(":id", $this->id);
    
            if ($stmt->execute()) {
                return true;
            }
    
            return false;
        }

}
?>
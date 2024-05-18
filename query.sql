use stc5hxkqsgukf26b;

create table user_join_info(
	user_id varchar(50) primary key,
    user_password varchar(250),
    user_role ENUM('General Member', 'President', 'Manager'), -- 일반 회원, 사장님, 관리자
    join_date datetime default now(),
    password_update datetime default now() on update now() 
);

create table user_info(
	user_id	varchar(50) primary key,
	user_name	varchar(10)	NOT NULL unique,
	phone_number	varchar(15)	NOT NULL,
	point_score	int	NULL	DEFAULT 0,
	app_version	varchar(20),
	gender	enum('M', 'F'),
	age	int,
	user_image	longtext,
    
    foreign key (user_id) REFERENCES user_join_info(user_id) ON UPDATE CASCADE
);

CREATE TABLE category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(25)
); -- 카테고리 테이블

REATE TABLE inquiry (
	inquiry_id	int AUTO_INCREMENT primary key,
	user_name	varchar(10)	NOT NULL,
	category_id	int	NOT NULL,
	title	varchar(100)	NOT NULL,
	content	text	NOT NULL,
    write_date datetime default now(),
	status	enum("pending", "complete")	NOT NULL DEFAULT "pending",
		
    foreign key (user_name) REFERENCES user_info(user_name) ON UPDATE CASCADE,
    foreign key (category_id) REFERENCES category(category_id) ON UPDATE CASCADE
);

CREATE TABLE answer (
	answer_id int auto_increment primary key,
    inquiry_id	int NOT NULL,
    user_name varchar(10) NOT NULL,
    content text NOT NULL,
    write_date datetime default now(),
    
    foreign key (user_name) REFERENCES user_info(user_name) ON UPDATE CASCADE
);

CREATE TABLE popup_stores ( -- 팝업 스토어 정보
    store_id INT AUTO_INCREMENT PRIMARY KEY, -- 고유 식별자
    category_id INT, -- 카테고리 ID
    store_name VARCHAR(255), -- 팝업 스토어 이름
    store_location VARCHAR(255), -- 위치
    store_contact_info VARCHAR(255), -- 팝업 연락처
    store_description TEXT, -- 팝업 소개
    store_status VARCHAR(50), -- 진행 예정 or 진행중 or 마감 상태 확인
    store_image LONGTEXT, -- 팝업 이미지
    store_artist_name VARCHAR(255), -- 작가 이름
    store_start_date DATE, -- 팝업 오픈 날짜
    store_end_date DATE, -- 팝업 종료 날짜
    store_mark_number INT DEFAULT 0, -- 찜 수
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);

CREATE TABLE store_schedules ( -- 요일별 시간
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT,
    day_of_week ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'),
    open_time TIME,
    close_time TIME,
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id) ON DELETE CASCADE
);

CREATE TABLE BookMark (
    user_id VARCHAR(50) NOT NULL,
    store_id INT NOT NULL,
    PRIMARY KEY (user_id, store_id),
    FOREIGN KEY (user_id) REFERENCES user_info(user_id),
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id)
);

CREATE TABLE store_review (
    review_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    review_rating INT NOT NULL,
    review_content LONGTEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_modified_date TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id),
    FOREIGN KEY (user_id) REFERENCES user_info(user_id)
);

CREATE TABLE products (
    product_id INT NOT NULL AUTO_INCREMENT,
    store_id INT,
    product_name VARCHAR(255) NOT NULL,
    product_price FLOAT NOT NULL,
    product_description LONGTEXT NOT NULL,
    product_mark_number INT DEFAULT 0, -- 찜 수
    PRIMARY KEY (product_id),
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id)
);

CREATE TABLE product_review (
    review_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    review_rating INT NOT NULL,
    review_content LONGTEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_modified_date TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (user_id) REFERENCES user_info(user_id)
);
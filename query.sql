use stc5hxkqsgukf26b;

create table user_join_info(
	user_id varchar(50) primary key,
    user_password varchar(250),
    user_role ENUM('General Member', 'President', 'Manager'), -- 일반 회원, 사장님, 관리자
    join_date datetime default now(),
    password_update datetime default now() on update now() 
);

create table user_info(
	user_id varchar(50) primary key,
    user_nickname varchar(10) unique,
    user_image longtext,
    phone_number varchar(15),
    point_score int,
    app_version varchar(20),
    
    foreign key (user_id) REFERENCES user_join_info(user_id) ON UPDATE CASCADE
);

CREATE TABLE category ( -- 카테고리 테이블
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(25)
);

CREATE TABLE popup_denial_logs ( -- 팝업 스토어 등록 거부 이유
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id VARCHAR(50),
    denial_reason TEXT,
    denial_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id)
);

CREATE TABLE popup_stores ( -- 팝업 스토어 정보
    store_id VARCHAR(50) PRIMARY KEY, -- 고유 식별자
    category_id INT, -- 카테고리 ID
    user_name VARCHAR(50), -- 팝업 등록자
    store_name VARCHAR(255), -- 팝업 스토어 이름
    store_location VARCHAR(255), -- 위치
    store_contact_info VARCHAR(255), -- 팝업 연락처
    store_description LONGTEXT, -- 팝업 소개
    store_status ENUM('오픈 예정', '오픈', '마감') DEFAULT '오픈 예정', -- 진행 예정 or 진행중 or 마감 상태 확인
    store_start_date DATE, -- 팝업 오픈 날짜
    store_end_date DATE, -- 팝업 종료 날짜
    store_mark_number INT DEFAULT 0, -- 찜 수
    store_view_count INT DEFAULT 0, -- 조회수
    store_wait_status ENUM('false', 'true') DEFAULT 'false', -- 대기 상태
    FOREIGN KEY (category_id) REFERENCES category(category_id),
    FOREIGN KEY (user_name) REFERENCES user_info(user_name)
);

CREATE TABLE store_schedules ( -- 요일별 시간
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id VARCHAR(50) NOT NULL,
    day_of_week ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'),
    open_time TIME,
    close_time TIME,
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id) ON DELETE CASCADE
);

CREATE TABLE products (
    product_id VARCHAR(50) NOT NULL, -- 상품 아이디
    store_id VARCHAR(50) NOT NULL, -- 스토어 아이디
    product_name VARCHAR(255) NOT NULL, -- 상품 이름 
    product_price FLOAT NOT NULL, -- 상품 가격
    product_description LONGTEXT NOT NULL, -- 상품 설명
    remaining_quantity INT, -- 잔여 수량
    product_mark_number INT DEFAULT 0, -- 찜 수
    PRIMARY KEY (product_id, store_id),
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id)
);

CREATE TABLE images (
    store_id VARCHAR(50) NOT NULL,
    image_url LONGTEXT NOT NULL,
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id)
);

CREATE TABLE BookMark (
    user_id VARCHAR(50) NOT NULL,
    store_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, store_id),
    FOREIGN KEY (user_id) REFERENCES user_info(user_id),
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id)
);

CREATE TABLE wait_list ( -- 대기 상태
	wait_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	store_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    wait_visitor_name VARCHAR(50) NOT NULL,
    wait_visitor_number INT NOT NULL,
    wait_reservation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    wait_status ENUM('waiting', 'queued', 'entered', 'skipped') DEFAULT 'queued', -- 대기 / 입장 대기 / 입장 완료 / 입장 X
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id),
    FOREIGN KEY (user_id) REFERENCES user_info(user_id)
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


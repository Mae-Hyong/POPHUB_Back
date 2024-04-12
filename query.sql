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

CREATE TABLE category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(25)
); -- 카테고리 테이블

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
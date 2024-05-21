use stc5hxkqsgukf26b;

create table user_join_info(
	user_id varchar(50) primary key,
    user_password varchar(250),
    user_role ENUM('General Member', 'President', 'Manager'), -- 일반 회원, 사장님, 관리자
    join_date datetime default now(),
    password_update datetime default now() on update now() 
);

create table user_info(
	user_id	varchar(50),
	user_name	varchar(50)	NOT NULL primary key, -- 50글자로 변경
	phone_number	varchar(15)	NOT NULL,
	point_score	int	NULL	DEFAULT 0,
	app_version	varchar(20),
	gender	enum('M', 'F'),
	age	int,
	user_image	longtext,
    withdrawal bool default False,
    
    foreign key (user_id) REFERENCES user_join_info(user_id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE user_delete (
    user_id VARCHAR(50) PRIMARY KEY,
    phone_number	varchar(15)	NOT NULL,
    delete_date DATETIME DEFAULT NOW()
);

CREATE TABLE inquiry (
	inquiry_id	int AUTO_INCREMENT primary key,
	user_name	varchar(50)	NOT NULL,
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
    user_name varchar(50) NOT NULL,
    content text NOT NULL,
    write_date datetime default now(),
    
    foreign key (user_name) REFERENCES user_info(user_name) ON UPDATE CASCADE
);

CREATE TABLE category (
	category_id	int AUTO_INCREMENT primary key,
	category_name	VARCHAR(25)	NOT NULL
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
    approval_status ENUM('pending', 'check', 'deny') DEFAULT 'pending', -- 승인 상태
    FOREIGN KEY (category_id) REFERENCES category(category_id),
    FOREIGN KEY (user_name) REFERENCES user_info(user_name)
);

CREATE TABLE popup_denial_logs ( -- 팝업 스토어 등록 거부 이유
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id VARCHAR(50),
    denial_reason TEXT,
    denial_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id)
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
    product_view_count INT DEFAULT 0, -- 조회수
    product_mark_number INT DEFAULT 0, -- 찜 수
    PRIMARY KEY (product_id, store_id),
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id)
);

CREATE TABLE images (
	image_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id VARCHAR(50),
    product_id VARCHAR(50),
    image_url LONGTEXT NOT NULL,
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE payment_details (
    order_id varchar(50) primary key, -- 주문 아이디
    store_id varchar(50),
    product_id varchar(50),
    partner_order_id VARCHAR(255) NOT NULL UNIQUE, -- 가맹점 주문 ID(카카오페이에서 제공)
    user_id varchar(50),
    item_name VARCHAR(255), -- 물품 명
    quantity INT, -- 상품 수량
    total_amount INT, -- 결제 금액
    vat_amount DECIMAL(10, 2), -- 부가세 (총자릿수, 소수점 이하 자릿수)
    tax_free_amount DECIMAL(10, 2), -- 비과세 금액
    status ENUM('pending', 'canceled', 'complete') DEFAULT 'pending', -- 주문 상태의 기본값 설정
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 주문 시간
    FOREIGN KEY (user_id) REFERENCES user_join_info(user_id),
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE payments ( -- 결제 정보
    payment_id varchar(50) PRIMARY KEY, -- 결제 ID (고유 식별자)
    order_id varchar(50), -- 주문 ID (Orders 테이블의 외래키)
    tid VARCHAR(255) NOT NULL UNIQUE, -- 결제 고유 번호 (카카오페이에서 제공)
    status ENUM("ready", "approved") DEFAULT "ready", -- 결제 상태
    aid VARCHAR(255), -- 승인 ID (카카오페이에서 제공)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 결제 생성 시간
    aid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES payment_details(order_id) -- Orders 테이블의 외래키
);

CREATE TABLE BookMark (
	mark_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(50) NOT NULL,
    store_id VARCHAR(50),
    product_id VARCHAR(50),
    FOREIGN KEY (user_name) REFERENCES user_info(user_name),
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE wait_list ( -- 대기 상태
	wait_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	store_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    wait_visitor_name VARCHAR(50) NOT NULL,
    wait_visitor_number INT NOT NULL,
    wait_reservation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    wait_status ENUM('waiting', 'queued', 'entered', 'skipped') DEFAULT 'queued', -- 대기 / 입장 대기 / 입장 완료 / 입장 X
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id),
    FOREIGN KEY (user_name) REFERENCES user_info(user_name)
);

CREATE TABLE store_review (
    review_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    store_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    review_rating INT NOT NULL,
    review_content LONGTEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_modified_date TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id),
    FOREIGN KEY (user_name) REFERENCES user_info(user_name)
);

CREATE TABLE product_review (
    review_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    review_rating INT NOT NULL,
    review_content LONGTEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_modified_date TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (user_name) REFERENCES user_info(user_name)
);

INSERT INTO category (category_id, category_name) VALUES
(0, '기술 문의'),
(1, '상품 문의'),
(2, '고객 서비스 문의'),
(3, '주문/배송 문의'),
(4, '회원 가입/로그인 문의'),
(10, '의류'),
(11, '액세서리'),
(12, '신발'),
(13, '가방/지갑'),
(14, '뷰티/화장품'),
(15, '가전제품'),
(16, '생활용품'),
(17, '푸드/음료'),
(18, '스포츠 용품'),
(19, '문구/책/잡화'),
(20, '유아용품'),
(21, '전자기기/액세서리'),
(22, '건강/웰빙 제품'),
(23, '패션/라이프스타일 제품'),
(24, '예술/공예품');
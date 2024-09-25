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

CREATE TABLE notice (
	notice_id int auto_increment primary key,
    title varchar(50),
    content text,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_name varchar(50),
    
    FOREIGN KEY (user_name) REFERENCES user_info(user_name)
);

CREATE TABLE category (
	category_id	int primary key,
	category_name	VARCHAR(25)	NOT NULL
);

CREATE TABLE inquiry (
	inquiry_id	int AUTO_INCREMENT primary key,
	user_name	varchar(50)	NOT NULL,
	category_id	int	NOT NULL,
	title	varchar(100)	NOT NULL,
	content	text	NOT NULL,
    image longtext,
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
    deleted ENUM('false', 'true') DEFAULT 'false', -- 팝업 삭제 여부
    max_capacity INT NOT NULL, -- 시간대별 최대 인원
    FOREIGN KEY (category_id) REFERENCES category(category_id) ON UPDATE CASCADE,
    FOREIGN KEY (user_name) REFERENCES user_info(user_name) ON UPDATE CASCADE
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
    PRIMARY KEY (product_id),
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
    funding_id varchar(50),
    item_id varchar(50),
    partner_order_id VARCHAR(255) NOT NULL UNIQUE, -- 가맹점 주문 ID(카카오페이에서 제공)
    user_name varchar(50),
    item_name VARCHAR(255), -- 물품 명
    quantity INT, -- 상품 수량
    total_amount INT, -- 결제 금액
    vat_amount DECIMAL(10, 2), -- 부가세 (총자릿수, 소수점 이하 자릿수)
    tax_free_amount DECIMAL(10, 2), -- 비과세 금액
    status ENUM('pending', 'canceled', 'complete') DEFAULT 'pending', -- 주문 상태의 기본값 설정
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 주문 시간
    status_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_name) REFERENCES user_info(user_name)  ON UPDATE CASCADE,
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (funding_id) REFERENCES funding(funding_id),
    FOREIGN KEY (item_id) REFERENCES funding_item(item_id)
);

CREATE TABLE payments ( -- 결제 정보
    partner_order_id VARCHAR(255) PRIMARY KEY, -- 결제 ID (고유 식별자)
    order_id varchar(50), -- 주문 ID (Orders 테이블의 외래키)
    tid VARCHAR(255) NOT NULL UNIQUE, -- 결제 고유 번호 (카카오페이에서 제공)
    status ENUM("ready", "approved") DEFAULT "ready", -- 결제 상태
    aid VARCHAR(255), -- 승인 ID (카카오페이에서 제공)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 결제 생성 시간
    aid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_order_id) REFERENCES payment_details(partner_order_id),
    FOREIGN KEY (order_id) REFERENCES payment_details(order_id) -- Orders 테이블의 외래키
);

CREATE TABLE BookMark (
	mark_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(50) NOT NULL,
    store_id VARCHAR(50),
    product_id VARCHAR(50),
    funding_id VARCHAR(50),
    FOREIGN KEY (user_name) REFERENCES user_info(user_name)  ON UPDATE CASCADE,
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (funding_id) REFERENCES funding(funding_id)
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
    FOREIGN KEY (user_name) REFERENCES user_info(user_name)  ON UPDATE CASCADE
);

CREATE TABLE reservation (
    reservation_id VARCHAR(50) NOT NULL PRIMARY KEY,
    store_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    capacity INT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reservation_status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id),
    FOREIGN KEY (user_name) REFERENCES user_info(user_name) ON UPDATE CASCADE
);



CREATE TABLE store_capacity (
    store_id VARCHAR(50) NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    max_capacity INT NOT NULL,
    current_capacity INT,
    PRIMARY KEY (store_id, reservation_date, reservation_time),
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id),
    FOREIGN KEY (max_capacity) REFERENCES popup_stores(max_capacity)
);

ALTER TABLE popup_stores
ADD INDEX idx_max_capacity (max_capacity);

CREATE TABLE product_review (
    review_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    review_rating INT NOT NULL,
    review_content LONGTEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_modified_date TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (user_name) REFERENCES user_info(user_name) ON UPDATE CASCADE
);

CREATE TABLE stand_store (
    user_name VARCHAR(50) NOT NULL,
    store_id VARCHAR(50) NOT NULL,
    stand_at TIMESTAMP NOT NULL,
    PRIMARY KEY (user_name, store_id)
);

CREATE TABLE wait_list (
    reservation_id VARCHAR(50) PRIMARY KEY,
    user_name VARCHAR(50) NOT NULL,
    store_id VARCHAR(50) NOT NULL,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    capacity INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_name) REFERENCES user_info(user_name) ON UPDATE CASCADE,
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id)
);

-- QR코드 생성
CREATE TABLE qrcodes (
	qrcode_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id VARCHAR(50) NOT NULL,
    qrcode_url TEXT NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id)
);

CREATE TABLE achieve (
	achieve_id int auto_increment primary key,
    title varchar(50),
    content varchar(150),
    conditions text,
    points int
);

CREATE TABLE achieve_hub (
	user_name VARCHAR(50),
    achieve_id int,
    complete_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    primary key (user_name, achieve_id),
    FOREIGN KEY (user_name) REFERENCES user_info(user_name) ON UPDATE CASCADE,
    FOREIGN KEY (achieve_id) REFERENCES achieve(achieve_id) ON UPDATE CASCADE
);

CREATE TABLE point_history (
    history_id int auto_increment primary key,
    user_name varchar(50),
    points int not null,
    description text,
    calcul ENUM("+", "-"),
    transaction_at timestamp default current_timestamp,
    FOREIGN KEY (user_name) REFERENCES user_info(user_name) ON UPDATE CASCADE
);

CREATE TABLE calendar (
    calendar_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(50) NOT NULL,
    store_id VARCHAR(50) NOT NULL,
    reservation_date DATE NOT NULL,
    FOREIGN KEY(user_name) REFERENCES user_info(user_name) ON UPDATE CASCADE,
    FOREIGN KEY(store_id) REFERENCES popup_stores(store_id)
);

ALTER TABLE calendar
ADD CONSTRAINT unique_reservation UNIQUE (user_name, store_id, reservation_date);

CREATE TABLE user_address (
	address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(50) NOT NULL,
    address VARCHAR(100) NOT NULL,
    create_at TIMESTAMP default now(),
    FOREIGN KEY (user_name) REFERENCES user_info(user_name) ON UPDATE CASCADE
);

CREATE TABLE delivery (
    delivery_id VARCHAR(50) PRIMARY KEY NOT NULL,  
    user_name VARCHAR(50) NOT NULL,
    address VARCHAR(100) NOT NULL,
    store_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    payment_amount INT NOT NULL, -- 결제 금액
    quantity INT NOT NULL, -- 주문 수량
    courier VARCHAR(20) DEFAULT NULL, -- 택배사
    tracking_number VARCHAR(30) DEFAULT NULL, -- 운송장 번호
    order_date DATETIME DEFAULT now() NOT NULL, -- 주문일
    status ENUM('주문 완료', '주문 취소', '배송중', '배송 완료') NOT NULL DEFAULT '주문 완료',
    cancel_reason ENUM('고객 변심', '상품 문제', '배송 지연', '기타') DEFAULT NULL, -- 주문 취소 사유
    FOREIGN KEY (store_id) REFERENCES popup_stores(store_id),
    FOREIGN KEY (user_name) REFERENCES user_info(user_name) ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

create Table funding (
    funding_id int auto_increment primary key,
    user_name varchar(50),
    title varchar(100),
    content text,
    amount int,
    donation int,
    status ENUM('pending', 'open', 'successful', 'fail') NOT NULL DEFAULT 'pending',
    open_date datetime,
    close_date datetime,
    payment_date datetime,
    
    foreign key (user_name) references user_info(user_name) on update cascade
);

create Table funding_img (
    img_id int auto_increment primary key,
    funding_id int,
    item_id int,
    image longtext,
    
    foreign key (funding_id) references funding(funding_id) on update cascade,
    foreign key (item_id) references funding_item(item_id) on update cascade
);

create Table funding_item(
    item_id int auto_increment primary key,
    funding_id int,
    user_name varchar(50),
    item_name varchar(25),
    content text,
    count int,
    amount int,
    foreign key (user_name) references user_info(user_name) on update cascade,
    foreign key (funding_id) references funding(funding_id) on update cascade
);

create table funding_list(
    list_id int auto_increment primary key,
    funding_id int,
    item_id int,
    partner_order_id VARCHAR(255),
    user_name varchar(50),
    count int,
    
    foreign key (funding_id) references funding(funding_id) on update cascade,
    foreign key (item_id) references funding_item(item_id) on update cascade,
    foreign key (user_name) references user_info(user_name) on update cascade,
    FOREIGN KEY (partner_order_id) REFERENCES payment_details(partner_order_id)
);

INSERT INTO category (category_id, category_name) VALUES
(0, '기술 문의'),
(1, '상품 문의'),
(2, '고객 서비스 문의'),
(3, '주문/배송 문의'),
(4, '회원 가입/로그인 문의'),
(5, '광고 문의'),
(10, '남성의류'),
(11, '여성의류'),
(12, '액세서리'),
(13, '신발'),
(14, '가방/지갑'),
(15, '뷰티/화장품'),
(16, '가전제품'),
(17, '생활용품'),
(18, '푸드/음료'),
(19, '스포츠'),
(20, '문구/잡화'),
(21, '도서'),
(22, '유아용품'),
(23, '전자기기/액세서리'),
(24, '건강/웰빙'),
(25, '패션/라이프스타일'),
(26, '예술/공예'),
(27, '애니메이션'),
(28, '체험'),
(29, '전시/문화')
(30, '연예인/굿즈'),
(31, '동물'),
(32, '캐릭터'),
(33, '캠페인');

INSERT INTO achieve (title, content, conditions, points) VALUES
('리뷰 스타터', '첫 리뷰 작성', '첫 리뷰를 작성한 사용자', 500),
('어서와? POPHUB는 처음이지?', '첫 회원가입', '회원가입을 완료한 사용자', 1000),
('탐색의 여정', '찜 10개', '10개 이상의 아이템을 찜한 사용자', 300),
('응원의 손길', '첫 펀딩', '첫 펀딩에 참여한 사용자', 500),
('첫걸음', '첫 상품 구매', '첫 상품을 구매한 사용자', 500),
('탐험의 시작', '팝업스토어 하나 이상 예약 후 방문시', '팝업스토어를 하나 이상 예약하고 방문한 사용자', 300),
('소중한 조언자', '첫 문의', '첫 문의를 작성한 사용자', 300),
('waiting...', '3번 이상 예약 대기 중인 사용자', '3번 이상 예약 대기 상태인 사용자', 1000),
('오랜 친구', '앱 가입 기간 1년 이상', '앱 가입 기간이 1년을 초과한 사용자', 1000);

alter table pophub.event
Add column end_date datetime;
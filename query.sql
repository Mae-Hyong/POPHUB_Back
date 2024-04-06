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
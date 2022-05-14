begin transaction;
insert into users (name, email, entries, joined)
values ('Puto', 'jojo@email.com',0,'2022-05-13 02:18:32.417');
commit;

begin transaction;
insert into login (hash, email)
values ('$2a$10$Hgnv5MWhKKViwyT6mk.7XOTyaeJ9ijyDODAOixElI4BlYPM9Eg91u','jojo@email.com');
commit;
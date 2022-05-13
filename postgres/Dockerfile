FROM postgres:10.3

# create our users and login tables to docker
ADD ./tables/ /docker-entrypoint-initdb.d/tables/
ADD ./seed/ /docker-entrypoint-initdb.d/seed/

ADD ./deploy_schema.sql/ /docker-entrypoint-initdb.d/

FROM eclipse-temurin:21-jdk AS build
WORKDIR /build

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q dependency:go-offline

COPY src/ src/
RUN ./mvnw -q clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar

EXPOSE 8002
ENTRYPOINT ["java", "-jar", "app.jar"]
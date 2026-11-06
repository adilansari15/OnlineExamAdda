package com.examadda;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

@SpringBootApplication
@EnableScheduling
public class ExamAddaApplication {

    public static void main(String[] args) {
        loadDotenvIfPresent();
        SpringApplication.run(ExamAddaApplication.class, args);
    }

    public static void loadDotenvIfPresent() {
        File[] candidateFiles = new File[]{
                new File(".env"),
                new File("../.env")
        };

        for (File file : candidateFiles) {
            if (file.exists() && file.isFile()) {
                Properties props = new Properties();
                try (FileInputStream fis = new FileInputStream(file)) {
                    props.load(fis);
                    props.forEach((k, v) -> {
                        String key = k.toString().trim();
                        String val = v.toString().trim();
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, val);
                        }
                    });
                } catch (IOException ignored) {
                    // Ignore and proceed with environment defaults
                }
                break;
            }
        }

        // Normalize DB_URL for JDBC
        String dbUrl = System.getProperty("DB_URL");
        if (dbUrl == null) {
            dbUrl = System.getenv("DB_URL");
        }
        if (dbUrl != null) {
            if (!dbUrl.startsWith("jdbc:")) {
                dbUrl = "jdbc:" + dbUrl;
            }
            System.setProperty("DB_JDBC_URL", dbUrl);
            System.setProperty("spring.datasource.url", dbUrl);
        }

        String dbUser = System.getProperty("DB_USERNAME");
        if (dbUser != null) {
            System.setProperty("spring.datasource.username", dbUser);
        }
        String dbPass = System.getProperty("DB_PASSWORD");
        if (dbPass != null) {
            System.setProperty("spring.datasource.password", dbPass);
        }
    }
}

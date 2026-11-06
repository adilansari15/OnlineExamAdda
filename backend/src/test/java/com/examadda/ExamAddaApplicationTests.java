package com.examadda;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ExamAddaApplicationTests {

    @BeforeAll
    static void setup() {
        ExamAddaApplication.loadDotenvIfPresent();
    }

    @Test
    void contextLoads() {
    }
}


package com.examadda.scheduler;

import com.examadda.entity.AttemptStatus;
import com.examadda.entity.ExamAttempt;
import com.examadda.repository.ExamAttemptRepository;
import com.examadda.service.ExamAttemptService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AttemptExpiryScheduler {

    private final ExamAttemptRepository examAttemptRepository;
    private final ExamAttemptService examAttemptService;
    private final Clock clock;

    @Scheduled(fixedRate = 30000)
    public void autoSubmitExpiredAttempts() {
        try {
            Instant threshold = clock.instant().minusSeconds(3);
            List<ExamAttempt> expiredAttempts = examAttemptRepository.findByStatusAndExpiresAtBefore(
                    AttemptStatus.IN_PROGRESS, threshold
            );

            for (ExamAttempt attempt : expiredAttempts) {
                try {
                    examAttemptService.submitAttempt(attempt.getId(), attempt.getUser().getId(), true);
                    log.info("Auto-submitted expired attempt ID: {}", attempt.getId());
                } catch (Exception e) {
                    log.error("Failed to auto-submit attempt ID: {}", attempt.getId(), e);
                }
            }
        } catch (Exception e) {
            log.warn("Scheduler cycle encountered an error: {}", e.getMessage());
        }
    }
}

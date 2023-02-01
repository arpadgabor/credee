import { ExternalPlatform, ExternalPlatforms } from '../../database/database.js'
import { z } from 'zod'
import { procedure, router } from '../../core/trpc.js'
import { createParticipant } from './participants.service.js'

const participantCreate = z.object({
  surveyId: z.number(),
  externalPlatform: z.enum(ExternalPlatforms as [string, ...string[]]),
  externalParticipantId: z.string(),
  ageRange: z.string().nullish(),
  gender: z.string().nullish(),
  nationality: z.string().nullish(),
  maritalStatus: z.string().nullish(),
  academicStatus: z.string().nullish(),
  employmentStatus: z.string().nullish(),
  annualIncomeLevel: z.string().nullish(),
  onboardingAnswers: z.record(z.string()).nullish(),
})

const participant = participantCreate.and(
  z.object({
    id: z.number(),
    createdAt: z.date(),
  })
)

const addParticipant = procedure
  .input(participantCreate)
  .output(participant)
  .mutation(async ({ input }) => {
    const participant = await createParticipant({
      survey_id: input.surveyId,
      external_platform: input.externalPlatform as keyof typeof ExternalPlatform,
      external_participant_id: input.externalParticipantId,
      age_range: input.ageRange,
      gender: input.gender,
      nationality: input.nationality,
      marital_status: input.maritalStatus,
      academic_status: input.academicStatus,
      employment_status: input.employmentStatus,
      annual_income_level: input.annualIncomeLevel,
      onboarding_answers: input.onboardingAnswers,
    })

    return {
      id: participant!.id,
      surveyId: participant!.survey_id,
      externalPlatform: participant!.external_platform,
      externalParticipantId: participant!.external_participant_id,
      ageRange: participant!.age_range,
      gender: participant!.gender,
      nationality: participant!.nationality,
      maritalStatus: participant!.marital_status,
      academicStatus: participant!.academic_status,
      employmentStatus: participant!.employment_status,
      annualIncomeLevel: participant!.annual_income_level,
      onboardingAnswers: participant!.onboarding_answers,
      createdAt: participant!.created_at,
    }
  })

export const ParticipantsRouter = router({
  onboard: addParticipant,
})

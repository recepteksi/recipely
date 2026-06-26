import { toFeedbackRequestDto } from '@infrastructure/feedback/feedback-mapper';
import { DEFAULT_FEEDBACK_CATEGORY } from '@domain/feedback/feedback-category';

describe('toFeedbackRequestDto', () => {
  describe('category', () => {
    it('always sets the default category', () => {
      const dto = toFeedbackRequestDto({ subject: '', message: 'My feedback' });

      expect(dto.category).toBe(DEFAULT_FEEDBACK_CATEGORY);
    });
  });

  describe('message', () => {
    it('passes the message through unchanged', () => {
      const dto = toFeedbackRequestDto({ subject: '', message: 'Hello world' });

      expect(dto.message).toBe('Hello world');
    });
  });

  describe('subject', () => {
    it('omits subject when it is an empty string', () => {
      const dto = toFeedbackRequestDto({ subject: '', message: 'msg' });

      expect('subject' in dto).toBe(false);
    });

    it('omits subject when it is only whitespace', () => {
      const dto = toFeedbackRequestDto({ subject: '   ', message: 'msg' });

      expect('subject' in dto).toBe(false);
    });

    it('includes subject when it has visible content', () => {
      const dto = toFeedbackRequestDto({ subject: 'My title', message: 'msg' });

      expect(dto.subject).toBe('My title');
    });

    it('trims whitespace from subject before including it', () => {
      const dto = toFeedbackRequestDto({ subject: '  padded  ', message: 'msg' });

      expect(dto.subject).toBe('padded');
    });
  });
});

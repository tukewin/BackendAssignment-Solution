import { Request, Response } from 'express';
import { AppError, errorHandler } from './errorHandler';

describe('Error Handler', () => {
  describe('AppError class', () => {
    it('should create error with message and status code', () => {
      const error = new AppError('Not found', 404);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
    });

    it('should have proper error name', () => {
      const error = new AppError('Test error', 500);
      expect(error.name).toBe('Error');
    });
  });

  describe('errorHandler middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
      jsonMock = jest.fn();
      statusMock = jest.fn().mockReturnValue({ json: jsonMock });

      mockRequest = {
        t: jest.fn((key: string) => `translated:${key}`),
      };
      mockResponse = {
        status: statusMock,
      };
      mockNext = jest.fn();

      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle AppError with custom status code', () => {
      const error = new AppError('Resource not found', 404);

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        data: null,
        message: 'Resource not found',
      });
    });

    it('should handle generic Error with 500 status', () => {
      const error = new Error('Something broke');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        data: null,
        message: 'translated:something_went_wrong',
      });
    });

    it('should use fallback message when translation not available', () => {
      const error = new Error('Something broke');
      const requestWithoutT = {} as Request;

      errorHandler(error, requestWithoutT, mockResponse as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        data: null,
        message: 'Something went wrong',
      });
    });

    it('should log error to console', () => {
      const error = new Error('Test error');
      const consoleSpy = jest.spyOn(console, 'error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it.each([400, 401, 403, 404, 422, 500])(
      'should correctly pass through status code %s',
      (statusCode) => {
        const error = new AppError('Test', statusCode);

        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

        expect(statusMock).toHaveBeenCalledWith(statusCode);
      }
    );
  });
});

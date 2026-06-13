import { Controller, Post, Body, Req, UseGuards, Sse } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ChatRequestDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Observable } from 'rxjs';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a chat message to the AI provider', description: 'Returns a complete response via non-streaming.' })
  @ApiResponse({ status: 200, description: 'Successful chat completion' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiResponse({ status: 503, description: 'AI Service unavailable' })
  async chat(@Req() req, @Body() body: ChatRequestDto) {
    const userId = req.user.userId;
    return this.aiService.chat(userId, body.messages, body.model);
  }

  @Post('chat/stream')
  @Sse()
  @ApiOperation({ summary: 'Stream chat response via Server-Sent Events', description: 'Yields token chunks as they arrive.' })
  @ApiResponse({ status: 200, description: 'Successful SSE connection' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  streamChat(@Req() req, @Body() body: ChatRequestDto): Observable<MessageEvent> {
    const userId = req.user.userId;
    
    return new Observable((subscriber) => {
      (async () => {
        try {
          const generator = this.aiService.stream(userId, body.messages, body.model);
          for await (const chunk of generator) {
            subscriber.next({ data: { chunk } } as MessageEvent);
          }
          subscriber.next({ data: { done: true } } as MessageEvent);
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      })();
    });
  }
}

import type { Router } from 'express';
import { InMemoryNewsRepository } from './infrastructure/persistence/news.repository';
import { CreateNewsUseCase } from './domain/create-news.use-case';
import { ListNewsUseCase } from './domain/list-news.use-case';
import { GetNewsByIdUseCase } from './domain/get-news-by-id.use-case';
import { UpdateNewsUseCase } from './domain/update-news.use-case';
import { DeleteNewsUseCase } from './domain/delete-news.use-case';
import { NewsRouter } from './infrastructure/transport/noticias.router';

export function buildNewsRouter(): Router {
  const repository = new InMemoryNewsRepository();

  return NewsRouter({
    createNew: new CreateNewsUseCase(repository),
    listNews: new ListNewsUseCase(repository),
    getNewsById: new GetNewsByIdUseCase(repository),
    updateNews: new UpdateNewsUseCase(repository),
    deleteNews: new DeleteNewsUseCase(repository),
  });
}

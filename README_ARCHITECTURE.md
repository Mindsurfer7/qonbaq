# Clean Architecture в Qonbaq

Проект использует Clean Architecture с разделением на три основных слоя:

## Структура проекта

```
lib/
├── core/                    # Общий функционал
│   ├── error/              # Обработка ошибок (Failures)
│   ├── usecase/            # Базовые классы для Use Cases
│   └── utils/              # Утилиты и константы
│
├── domain/                 # Бизнес-логика (независимый слой)
│   ├── entities/           # Доменные сущности
│   ├── repositories/       # Интерфейсы репозиториев
│   └── usecases/           # Use Cases (бизнес-логика)
│
├── data/                   # Слой данных (зависит от domain)
│   ├── models/             # Модели данных (с сериализацией)
│   ├── datasources/        # Источники данных (remote/local)
│   └── repositories/       # Реализация репозиториев
│
└── presentation/           # UI слой (зависит от domain и data)
    ├── pages/              # Экраны приложения
    ├── widgets/            # Переиспользуемые виджеты
    ├── providers/          # State management (Provider/ChangeNotifier)
    └── bloc/               # State management (BLoC)
```

## Правила зависимостей

1. **Domain** - не зависит ни от чего (чистая бизнес-логика)
2. **Data** - зависит только от Domain
3. **Presentation** - может зависеть от Domain и Data
4. **Core** - используется всеми слоями

## Пример использования

### 1. Создание Entity (Domain)
```dart
class User extends Entity {
  final String id;
  final String name;
  // ...
}
```

### 2. Создание Repository Interface (Domain)
```dart
abstract class UserRepository {
  Future<Either<Failure, User>> getUserById(String id);
}
```

### 3. Создание Use Case (Domain)
```dart
class GetUser implements UseCase<User, String> {
  final UserRepository repository;
  // ...
}
```

### 4. Реализация Data Source (Data)
```dart
abstract class UserRemoteDataSource {
  Future<UserModel> getUserById(String id);
}
```

### 5. Реализация Repository (Data)
```dart
class UserRepositoryImpl implements UserRepository {
  final UserRemoteDataSource remoteDataSource;
  // ...
}
```

### 6. Использование в Presentation
```dart
class HomePage extends StatelessWidget {
  final GetUser getUserUseCase;
  
  // Использование Use Case
  final result = await getUserUseCase.call(userId);
  result.fold(
    (failure) => // Обработка ошибки,
    (user) => // Отображение данных
  );
}
```

## Преимущества

- ✅ Разделение ответственности
- ✅ Независимость от фреймворков
- ✅ Легкое тестирование
- ✅ Масштабируемость
- ✅ Переиспользуемость кода


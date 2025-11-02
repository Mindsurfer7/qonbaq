/// Базовые классы для обработки ошибок
abstract class Failure {
  final String message;

  const Failure(this.message);

  @override
  String toString() => message;
}

/// Ошибки сервера
class ServerFailure extends Failure {
  const ServerFailure(super.message);
}

/// Ошибки кэша
class CacheFailure extends Failure {
  const CacheFailure(super.message);
}

/// Ошибки сети
class NetworkFailure extends Failure {
  const NetworkFailure(super.message);
}

/// Общие ошибки
class GeneralFailure extends Failure {
  const GeneralFailure(super.message);
}

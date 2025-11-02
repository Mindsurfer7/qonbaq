import 'package:dartz/dartz.dart';
import '../error/failures.dart';

/// Базовый класс для Use Cases
///
/// [Type] - тип возвращаемого значения
/// [Params] - параметры для Use Case
abstract class UseCase<Type, Params> {
  Future<Either<Failure, Type>> call(Params params);
}

/// Use Case без параметров
abstract class UseCaseNoParams<Type> {
  Future<Either<Failure, Type>> call();
}

/// Пустые параметры для Use Case
class NoParams {
  const NoParams();
}

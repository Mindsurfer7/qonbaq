import 'package:dartz/dartz.dart';
import '../../core/error/failures.dart';
import '../../core/usecase/usecase.dart';
import '../entities/user.dart';
import '../repositories/user_repository.dart';

/// Use Case для получения пользователя по ID
class GetUser implements UseCase<User, String> {
  final UserRepository repository;

  GetUser(this.repository);

  @override
  Future<Either<Failure, User>> call(String userId) async {
    return await repository.getUserById(userId);
  }
}

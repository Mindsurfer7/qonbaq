/// Базовый интерфейс для источников данных
///
/// DataSource определяет способы получения данных:
/// - RemoteDataSource (API, сеть)
/// - LocalDataSource (база данных, кэш)
abstract class DataSource {
  const DataSource();
}

defmodule Chat.Repo.Migrations.CreateMessages do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :room_id, :string
      add :message, :text
      add :sent_by, :string
      add :msg_type, :string
      add :is_read, :string
      add :wvid, :string

      timestamps()
    end

  end
end

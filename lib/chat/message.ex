defmodule Chat.Message do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, only: [from: 2]

  schema "messages" do
    field :is_read, :string
    field :message, :string
    field :msg_type, :string
    field :room_id, :string
    field :sent_by, :string
    field :wvid, :string
    field :file_name, :string
    timestamps()
  end

  @doc false
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:room_id, :message, :sent_by, :msg_type, :is_read, :wvid, :file_name])
    |> validate_required([:room_id, :message, :sent_by, :msg_type, :is_read, :wvid, :file_name])
  end

 
  
    def get_messages(room,wvid) do
      query = from m in Chat.Message,
      where: m.room_id == ^room,
      where: m.wvid == ^wvid,
      order_by: [asc: m.inserted_at],
      select: [:sent_by,:msg_type,:is_read,:message,:room_id,:id,:wvid,:inserted_at,:file_name]
      Chat.Repo.all(query)
  end

  def get_message_count(room,wvid) do
#   Repo.one(from p in "people", select: count(p.id))
    query = from m in Chat.Message,
    where: m.room_id == ^room,
    where: m.wvid == ^wvid,
    where: m.sent_by == "SERVER",
    select: count(m.id)
    Chat.Repo.one(query)
end

  
  
end

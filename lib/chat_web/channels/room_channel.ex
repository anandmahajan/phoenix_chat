defmodule ChatWeb.RoomChannel do
  use ChatWeb, :channel
  alias ChatWeb.Presence
  
  def join("room:"<>room, payload, socket) do
    
    if authorized?(payload) do
        send(self(), {:after_join,room,payload,'JOIN'})
        {:ok, assign(socket, :room, room)}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end
  def leave("room:"<>room, socket) do
    :ok
  end
  def handle_in("ping", %{"wvid" => wvid,"room" => room,"user_type"=>user_type}, socket) do
     Chat.Message.get_messages(room,wvid)
          |> Enum.each(fn msg -> push(socket, "shout", %{
              sent_by: msg.sent_by,
              message: msg.message,
              wvid: wvid,
              msg_type: msg.msg_type,
              time: msg.inserted_at,
              file_name: msg.file_name
            }) end)
    {:noreply, socket}
  end
  
  def handle_in("shout", payload, socket) do
    Chat.Message.changeset(%Chat.Message{}, payload) |> Chat.Repo.insert  
    broadcast socket, "shout", payload
    {:noreply, socket}
  end

  defp authorized?(_payload) do
    true
  end

  def handle_info({:after_join,room,  %{"wvid" => wvid,"user_type"=>user_type,"user_name"=>user_name},type}, socket) do
      # if wvid !== nil do
    
    
        if type==='JOIN' do
          #  
            push(socket, "presence_state", Presence.list(socket))
            {:ok, _} = Presence.track(socket, wvid, %{
                online_at: inspect(System.system_time(:second)),
                wvid: wvid,
                user_type: user_type,
                typing: false,
                user_name: user_name
            })
        end
    # end
    {:noreply, socket}
  end


  def handle_in("user:typing", %{"typing" => typing,"wvid"=> wvid,"sent_by"=> sent_by,"user_name"=>user_name}, socket) do
    if sent_by==="SERVER" do
      {:ok, _} = Presence.update(socket,"", %{
        typing: typing,
        wvid: wvid,
        sent_by: sent_by,
        user_name: user_name

      })
    else 
      {:ok, _} = Presence.update(socket,wvid, %{
        typing: typing,
        wvid: wvid,
        sent_by: sent_by,
        user_name: user_name
      })
    end
    {:noreply, socket}
  end

  def handle_in("user:msgcount", %{"wvid"=> wvid,"room"=>room}, socket) do
    a=Chat.Message.get_message_count(room,wvid)
    IO.puts("shubham server #{a}")
    {:reply, {:ok, %{kind: "private", from: "server", count: a}}, socket}
  end
  
end




